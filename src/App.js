import React from 'react';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: []
    }

    // Bind handlers
    // this.addTransactionHandler.bind(this);
  }

  /*
  addTransactionHandler(transaction) {
    transactions = this.state.transactions.slice();
    transactions.push(transaction);
  }
  */

  render() {
    return (
      <div className="App">
        <div className="Header"><h1>Monero Profit Calculator</h1></div>
        <div className="TotalProfit"></div>
        <div className="Transaction"></div>
        <div className="Transaction"></div>
      </div>
    );
  }
}

export default App;
