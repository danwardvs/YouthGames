import React from 'react';
import logo from './logo.svg';
import './App.css';
import { ChatMessage, ChatState } from './types';
import { ChatContext } from './ChatContext';

class App extends React.Component {
  static contextType = ChatContext;

  state: ChatState = {
    messages: [
      {
        message: 'Welcome! Type a message and press Send Message to continue the chat.',
        author: "Danny's Youth Game Server Bot"
      }
    ],
    input: '',
    author: 'newUser',
    started:2
    
  }

  


  componentDidMount () {

    //initiate socket connection
    this.context.init();

    const observable = this.context.onMessage();

    observable.subscribe((m: ChatMessage) => {
      let messages = this.state.messages;

      messages.push(m);
      this.setState({ messages: messages });
    });
  }

  componentWillUnmount () {
    this.context.disconnect();
  }

  render () {

    const updateInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
      this.setState({ input: e.target.value });
    }

    const handleMessage = (): void => {

   

      if (this.state.input !== '') {
        this.context.send({
          message: this.state.input,
          author: this.state.author
        });
        this.setState({ input: '' });
        
        
        
      }
    };

    const handleName = (): void => {

      

      if (this.state.input !== '') {
        this.context.send({
          message: "has arrived!",
          author: this.state.input
        });
        this.setState({ input: '' });
        this.setState({started:1})
        this.setState({author:this.state.input})

      }
    };

    let msgIndex = 0;
    if(this.state.started===2){
    return (
      <div className="App">
        <img src={logo} className="App-logo" alt="logo" />

        <div className="App-chatbox">
          {this.state.messages.map((msg: ChatMessage) => {
            msgIndex++;
            return (
              <div key={msgIndex}>
                <p>{msg.author}</p>
                <p>
                  {msg.message}
                </p>
              </div>
            );
          })}
        </div>
        <input
          className="App-Textarea"
          placeholder="Type your messsage here..."
          onChange={updateInput}
          value={this.state.input}
        />
        <p>
          <button onClick={() => { handleMessage() }}>
            Send Message
          </button>
        </p>
      </div>
    );
  }else if(this.state.started===0){
    return(
      <div className="App">
        Hello welcome to die
        <input
          className="App-Textarea"
          placeholder="Please enter your name!"
          onChange={updateInput}
          value={this.state.input}
        />
        <p>
          <button onClick={() => { handleName() }}>
            Enter Name
          </button>
        </p>
      </div>
    )
  }else if(this.state.started===1){
    return(
    <div className="App">
    <img src={logo} className="App-logo" alt="logo" />

    <div className="App-chatbox">
      {this.state.messages.map((msg: ChatMessage) => {
        msgIndex++;
        return (
          <div key={msgIndex}>
            <p>{msg.author}</p>
            <p>
              {msg.message}
            </p>
          </div>
        );
      })}
    </div>
    </div>)
  }
}
}

export default App;
