# To run the Back-end server
You need to have python version > 3 with PIP installed

- Go to Back-end folder and install dependencies using this command

`pip install flask flask-mail bs4 tensorflow`

- Update informations about your models in *chatbot/Chatbots.json*

- deploy your server using the following command

`python app.py`

# Now for the front-end part
you need to have node.js with npm (node package manager) installed

- install expo cli using this command

`npm install -g expo-cli`

- go to the front-end folder end install dependencies using

`expo install`

- update your server's url in _data/dataSaver.js_

you need change the value of the constant variable on top with the url of the server you lunched above

`const serverURL = 'Your URL goes here' // 'http://example.com:5000'`

### To preview the app in your android or ios device 
- In your phone install **EXPO** app from play store
- Then run this command and scan the QR code using the **EXPO** app   

`expo start`

### To build your apk file 

- run the following command and follow instructions

`expo build:android -t apk`
