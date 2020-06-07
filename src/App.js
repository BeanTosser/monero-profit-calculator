import React from 'react';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: []
    }
    // Bind handlers
    this.addTransaction = this.addTransaction.bind(this);
  }

  addTransaction(){
    let transactions = this.state.transactions.slice();
    transactions.push(<TransactionContainer />);
    this.setState({transactions: transactions});
  }

  render() {
    return (
      <div className="App">
        <div className="Header"><h1>Monero Profit Calculator</h1></div>
        <div className="TotalProfit"></div>
        {this.state.transactions}
        <AddTransactionButton onClick={this.addTransaction} />
      </div>
    );
  }
}

function TransactionContainer(props) {
  return(
    <div className="Transaction">
      <div className="EntryArea">
        <Prompt type="text" name="Volume" size="12" />
        <Prompt type="date" name="Date" />
      </div>
      <ProfitDataTable />
    </div>
  );
}

class AddTransactionButton extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <button id="AddTransaction" onClick={this.props.onClick}>+</button>;
  }
}

function Prompt(props) {
  return(
  <div className="Prompt">
    {props.name}: <input type={props.type} name={props.name} size={props.size} />
  </div>
  );
}

class ProfitDataTable extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <table>
        <tr className = "TableLabels">
          <td>Purchase Value</td><td>Present Value</td>
        </tr>
        <tr>
          <td>100.00</td><td>100.00</td>
        </tr>
        <tr>
          <td>100.00</td><td>100.00</td>
        </tr>
      </table>
    );
  }
}

export default App;
