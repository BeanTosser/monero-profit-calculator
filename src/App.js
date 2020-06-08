import React from 'react';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: [],
      investmentData: [],
      profitData: []
    }
    // Bind handlers
    this.addTransaction = this.addTransaction.bind(this);
    this.handleVolumeChange = this.handleVolumeChange.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
  }

  addTransaction(){
    let transactions = this.state.transactions.slice();
    let investmentData = this.state.investmentData.slice();
    let profitData = this.state.profitData.slice();
    investmentData.push({
      volume: 0,
      date: new Date
    });
    profitData.push({
      valueAtPurchase: 0,
      valueAtPresent: 0,
      valueChange: 0
    });

    transactions.push(<TransactionContainer
      id={transactions.length}
      investmentData = {investmentData[investmentData.length-1]}
      profitData = {profitData[profitData.length-1]}
      handleVolumeChange={this.handleVolumeChange}
      handleDateChange={this.handleDateChange}
    />);

    this.setState({
      transactions: transactions,
      investmentData: investmentData,
      profitData: profitData
    });
  }

  handleVolumeChange(transactionId, volume) {
    alert("Txid: " + transactionId + " , Volume: " + volume);
    let investmentData = this.state.investmentData.slice();
    let profitData = this.state.profitData.slice();

    investmentData[transactionId] = {
      volume: volume,
      date: investmentData[transactionId].date
    };

    //TEMPORARY - right now this function just needs to run.
    // Later it will need to calculate actual present and historical
    // monero values based oncoingecko API queries
    profitData[transactionId] = {
      valueAtPurchase: volume,
      valueAtPresent: volume,
      valueChange: volume
    };
    this.setState((state, props) => ({
      transactions: state.transactions,
      investmentData: investmentData,
      profitData: profitData
    }));
    alert("changeHandler running!");
  }

  handleDateChange(transactionId, date) {
    // Will implement this function later
    // Requires coingecko API interaction
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

class TransactionContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.onVolumeChange = this.onVolumeChange.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
  }

  onVolumeChange(event) {
    this.setState({volumeInput: event.target.value});
    this.props.handleVolumeChange(this.props.id, event.target.value);
  }

  onDateChange(event) {
    this.props.handleDateChange(this.props.id, this._dateInput)
  }

  render() {
    return(
      <div className="Transaction">
        <div className="EntryArea">
          <Prompt
            ref={(c) => this.volumeInput = c}
            type="number"
            name="Volume"
            size="12"
            value="this.state.volumeInput"
            onKeyUp={this.onVolumeChange}
            onMouseUp={this.onDateChange}
          />
          <Prompt
            ref={(c) => this._dateInput = c}
            type="date"
            name="Date"
            onKeyUp={this.onDateChange}
            onMouseUp={this.onDateChange}
          />
        </div>
        <ProfitDataTable data={this.props.profitData} />
      </div>
    );
  };
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
    {props.name}: <input type={props.type} name={props.name} size={props.size} onKeyUp={props.onKeyUp} onMouseUp={props.onMouseUp} />
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
          <td>Profit/Loss: </td><td>100.00</td>
        </tr>
      </table>
    );
  }
}

export default App;
