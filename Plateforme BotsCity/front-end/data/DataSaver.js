const serverURL = 'Your URL goes here' // 'http://example.com:5000'

class DataSaver {
    chatHistory = {
    };
    component = [];
    c=null;
    constructor() {
    }

    load = () => {
        return fetch(serverURL+'/list')
            .then(res => res.json())
            .then(anser => {
                anser.map(a => {
                    this.chatHistory[a.name] = [
                        {
                            from: true,
                            text: 'مرحبا بك'
                        },
                        {
                            from: true,
                            text: 'جرب أن تسأل أي سؤال ؟'
                        }
                    ];
                    this.component.push(a);
                    return true;
                })
            });
    };

    addMsgRequest = async (theme,text)=>{
        let a = [];
        await fetch(serverURL+'/ask/'+theme+'?query='+text)
            .then(res=>res.json())
            .then(anser => a.push(anser.ans));
        this.chatHistory[theme] = [
            ...this.chatHistory[theme],
            {
                from: false,
                text: text
            },
            {
                from: true,
                text: a[0]
            }
        ];
    };

    loadModel = (theme) =>{
        fetch(serverURL+'/load/'+theme);
    };

    sendSuggestion = (theme,question,response)=>{
        fetch(serverURL+'/propose/'+theme+'?question='+question+'&response='+response)
    }

}
export default DataSaver;