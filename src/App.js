import React from 'react';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: [],
      investmentData: [],
      profitData: [],
      purchasePrices: [],
      currentPrice: 55.23, //Fake dummy price,
      netChange: 0.0
    }
    // Bind handlers
    this.addTransaction = this.addTransaction.bind(this);
    this.handleVolumeChange = this.handleVolumeChange.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
  }

  calculateNetChange() {
    let netChange = 0;
    for(let i=0; i < this.state.profitData.length; i++){
      netChange += Number(this.state.profitData[i].valueChange);
    }
    //netChange = netChange.tofixed(2);
    alert("Setting netChange to " + netChange);
    this.setState({netChange: netChange});
  }

  getFakePurchasePrice() {
    return 50 + (Math.random() - 0.5) * 20
  }

  addTransaction(){
    let transactions = this.state.transactions.slice();
    let investmentData = this.state.investmentData.slice();
    let profitData = this.state.profitData.slice();
    let purchasePrices = this.state.purchasePrices.slice();

    // Change to 0.00 for final build
    const volume = 1.236
    investmentData.push({
      volume: volume, // Dummy value
      date: this.convertDateToInputString(new Date())
    });

    // Temporary for testing
    purchasePrices.push(this.getFakePurchasePrice());

    let valueAtPurchase = (investmentData[investmentData.length-1].volume * purchasePrices[purchasePrices.length-1]).toFixed(2);
    let valueAtPresent = (investmentData[investmentData.length-1].volume * this.state.currentPrice).toFixed(2);
    let valueChange = (valueAtPresent - valueAtPurchase).toFixed(2);

    profitData.push({
      valueAtPurchase: valueAtPurchase,
      valueAtPresent: valueAtPresent,
      valueChange: valueChange
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
      profitData: profitData,
      purchasePrices: purchasePrices,
    }, this.calculateNetChange);
  }

  convertDateToInputString(date) {
    return date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();
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
        <div className="TotalProfit">${this.state.netChange}</div>
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
    alert("props.investmentData.date: " + this.props.investmentData.date);
  }

  onVolumeChange(event) {
    this.setState({volumeInput: event.target.value});
    this.props.handleVolumeChange(this.props.id, event.target.value);
  }

  onDateChange(event) {
    alert(event.target.value);
    this.setState({dateInput: event.target.value});
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
            value={this.props.investmentData.volume}
            onChange={this.onVolumeChange}
          />
          <Prompt
            ref={(c) => this._dateInput = c}
            type="date"
            name="Date"
            value={this.props.investmentData.date}
            onChange={this.onDateChange}
          />
        </div>
        <ProfitDataTable profitData={this.props.profitData} />
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
    {props.name}: <input value = {props.value} type={props.type} name={props.name} size={props.size} onChange={props.onChange} />
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
          <td>{this.props.profitData.valueAtPurchase}</td><td>{this.props.profitData.valueAtPresent}</td>
        </tr>
        <tr>
          <td>Profit/Loss: </td><td>{this.props.profitData.valueChange}</td>
        </tr>
      </table>
    );
  }
}

export default App;
