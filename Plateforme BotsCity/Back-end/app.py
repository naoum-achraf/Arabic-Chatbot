from abc import ABC
from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
from keras.preprocessing.text import Tokenizer
from keras.preprocessing.sequence import pad_sequences
import numpy as np
import requests
from bs4 import BeautifulSoup


def pad(x, length=None):
    if length is None:
        length = max([len(sentence) for sentence in x])
        print('Length Max: {}'.format(length))
        print()
    return pad_sequences(x, maxlen=length, padding='post')


def preprocess(Q, A):
    preprocess_Q, Q_tk = tokenize(Q)
    preprocess_A, A_tk = tokenize(A)

    preprocess_Q = pad(preprocess_Q)
    preprocess_A = pad(preprocess_A)

    # Keras's sparse_categorical_crossentropy function requires the labels to be in 3 dimensions
    preprocess_A = preprocess_A.reshape(*preprocess_A.shape, 1)

    return preprocess_Q, preprocess_A, Q_tk, A_tk


def toPredectible(qes, tok, shape):
    tt = []
    for q in qes.split(' '):
        if q in tok.word_index:
            tt.append(tok.word_index[q])
        else:
            tt.append(0)
    return pad([tt], shape)


def tokenize(x):
    tokenizer = Tokenizer(char_level=False, filters='!"#$%&()*+,-./:;=?@[\\]^_`{|}~\t\n')
    tokenizer.fit_on_texts(x)

    return tokenizer.texts_to_sequences(x), tokenizer


def logits_to_text(logits, tokenizer):
    index_to_words = {id: word for word, id in tokenizer.word_index.items()}
    index_to_words[0] = '<PAD>'
    return ' '.join([index_to_words[prediction] for prediction in np.argmax(logits, 1)])


class Chatbot(ABC):
    model = None
    question = None
    preproc_Q = None
    Q_tokenizer = None
    max_Q_sequence_length = None
    Q_vocab_size = None
    status = False

    # methode pour charger le modele
    def load(self):
        self.model = load_model(self.modelPath)
        self.load_corpus()
        self.status = True
        return True

    def load_corpus(self):
        pass

    # methode abstraite qui prend une question et renvoie sa reponse
    def get_answer(self, query):
        pass

    # methode pour verifier si le modele est charger
    def get_status(self):
        return self.status


class Seq2SeqChatbot(Chatbot):
    preproc_A = None
    A_tokenizer = None
    max_A_sequence_length = None
    A_vocab_size = None

    # Constructeur
    def __init__(self, name, model_path, ques, res):
        self.modelPath = model_path
        self.name = name
        self.status = False
        self.quesP = ques
        self.resP = res

    def load_corpus(self):
        file = open(self.resP, 'rt', encoding='utf-8')
        text = file.read()
        A_data = text.split("\n")
        help = A_data[0].replace('\ufeff', '')
        del A_data[0]
        A_data.insert(0, help)
        file = open(self.quesP, 'rt', encoding='utf-8')
        text = file.read()
        Q_data = text.split("\n")
        help = Q_data[0].replace('\ufeff', '')
        del Q_data[0]
        Q_data.insert(0, help)

        # Prétraitement
        self.preproc_Q, self.preproc_A, self.Q_tokenizer, self.A_tokenizer = preprocess(Q_data, A_data)
        self.max_Q_sequence_length = self.preproc_A.shape[1]
        self.max_A_sequence_length = self.preproc_Q.shape[1]

        self.Q_vocab_size = len(self.Q_tokenizer.word_index)
        self.A_vocab_size = len(self.A_tokenizer.word_index)

    def get_answer(self, query):
        question = toPredectible(query, self.Q_tokenizer, self.max_Q_sequence_length)
        print(question)
        return logits_to_text(self.model.predict(question)[0], self.A_tokenizer).replace('<PAD> ', '').replace('<PAD>', '').replace('<start> ', '').replace('<end>', '')


class ClassificationChatbot(Chatbot):
    h_data = None

    def __init__(self, name, model_path, ques, help):
        self.modelPath = model_path
        self.name = name
        self.status = False
        self.quesP = ques
        self.help = help

    def load_corpus(self):
        file = open(self.quesP, 'r', encoding='utf-8')
        text = file.read()
        Q_data = text.split("\n")
        help = Q_data[0].replace('\ufeff', '')
        del Q_data[0]
        Q_data.insert(0, help)

        file = open(self.help, 'r', encoding='utf-8')
        text = file.read()
        self.h_data = text.split("\n")
        help = self.h_data[0].replace('\ufeff', '')
        del self.h_data[0]
        self.h_data.insert(0, help)

        self.preproc_Q, self.Q_tokenizer = self.preprocess(Q_data)
        self.max_Q_sequence_length = self.preproc_Q.shape[1]
        self.Q_vocab_size = len(self.Q_tokenizer.word_index) + 1

    def preprocess(self, Q_data):
        preprocess_Q, Q_tk = tokenize(Q_data)
        preprocess_Q = pad(preprocess_Q)
        return preprocess_Q, Q_tk

    def get_answer(self, query):
        question = toPredectible(query, self.Q_tokenizer, self.max_Q_sequence_length)
        a = self.model.predict(np.array(question))[0]
        a = list(a)
        id = a.index(max(a))

        # on detecte les classes ou le chatbot doit chercher la reponse
        if id == 80:
            url = 'https://covid.hespress.com/'
            resp = requests.get(url=url)
            data = BeautifulSoup(resp.text)
            cases = [d.string for d in data.find_all('h4')]
            totalcases = cases[0]
            noncovid = cases[1]
            healed = cases[2]
            deaths = cases[3]
            recovring = cases[4]
            plus = data.find_all('span')
            totalcasesplus = str(plus[2]).split('</i>')[1].replace('</span>', '')
            response = 'تم تسجيل ' + totalcasesplus + ' حالة جديدة, حيت بلغ العدد الإجمالي للحالات ' + totalcases
            return response
        return self.h_data[id]


class Gestion:
    DataBase = 'chatbot/Chatbots.json'
    bots_objects = {}

    def __init__(self):
        with open(self.DataBase, 'r') as myfile:
            data = myfile.read()
        bots = json.loads(data)["chatbots"]

        # La creation des instances des chatbots selon le type (Seq2Seq ou Classification)
        for bot in bots:
            if bot['type'] == 'Seq2Seq':
                self.bots_objects[bot["intitule"]] = Seq2SeqChatbot(bot["intitule"],
                                                                    bot["modelName"],
                                                                    bot["questionsPath"],
                                                                    bot["responsesPath"])
            elif bot['type'] == 'classification':
                self.bots_objects[bot["intitule"]] = ClassificationChatbot(bot["intitule"],
                                                                           bot["modelName"],
                                                                           bot["questionsPath"],
                                                                           bot["responsesPath"])

    def load_bot(self, name):
        if self.bots_objects[name].get_status():
            return True
        else:
            return self.bots_objects[name].load()

    def get_answer(self, name, query):
        if self.bots_objects[name].get_status():
            return self.bots_objects[name].get_answer(query)
        else:
            return 'إنتضر قليلا من فضلك'

    # Creer une liste des chatbots pour l'utilisateur
    def list(self):
        lbot = []
        for key in self.bots_objects:
            lbot.append({
                "name": key,
                "uri": "https://picsum.photos/200/300",
                "color": "red",
                "describtion": "أنا صديقكم الألي"
            })
        return lbot

    def add_proposition(self, app, name, question, response):
        pass


# Creer l'instance du serveur flask
import json
app = Flask('__main__')

#Creer l'instance du gestionnaire
gst = Gestion()


@app.route('/ask/<name>', methods=['GET'])
def hello_world(name):
    answer = gst.get_answer(name, request.args.get('query'))
    return jsonify(ans=answer)


@app.route('/load/<name>', methods=['GET'])
def load_bot(name):
    gst.load_bot(name)
    return jsonify(ans=True)


@app.route('/list', methods=['Get'])
def list_of_bots():
    lbot = gst.list()
    return jsonify(lbot)


@app.route('/propose/<name>', methods=['Post'])
def propose(name):
    gst.add_proposition(app, name, request.args.get('question'), request.args.get('response'))
    return jsonify(ans=True)


if __name__ == "__main__":
    app.run(__name__)
