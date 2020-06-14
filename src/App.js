import React from 'react';
import './App.css';

// Global constants
const CURRENT_PRICE_API_URL = "https://api.coingecko.com/api/v3/simple/price?ids=monero&vs_currencies=usd"
// This request URL is split in two because the appropriate date value must be inserted between them to
// form the complete date string
const PRICE_AT_DATE_URL_PARTS = ["https://api.coingecko.com/api/v3/coins/monero/history?date=","&localization=false"]

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: [],
      investmentData: [],
      profitData: [],
      purchasePrices: [],
      currentPrice: 0.00, //Fake dummy price,
      netChange: 0.0
    }
    // Bind handlers
    this.addTransaction = this.addTransaction.bind(this);
    this.handleVolumeChange = this.handleVolumeChange.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
  }

  componentDidMount(){
    this.getCurrentMoneroPrice();
  }

  handleDateChange(transactionId, date){
    alert("handleDateChange; date: " + date);
    // Contingency: the date input has an option to "clear" the date, thus
    // Sending this function a null date variable which causes an error further
    // down the line.
    // If the user clears the date, we'll just reset it to the current date.
    if (date == "") {
      date = this.convertDateToInputString(new Date());
    }
    let request = new XMLHttpRequest();
    request.addEventListener('load', this.setTransactionValueAtDate.bind(this, request, transactionId, date));

    //Convert the date to a dd-mm-yyyy string for the coingecko API
    let coingeckoDate = date.substring(8) + date.substring(4,8) + date.substring(0,4);
    alert('coingeckoDate: ' + coingeckoDate);
    let urlString = PRICE_AT_DATE_URL_PARTS[0] + coingeckoDate + PRICE_AT_DATE_URL_PARTS[1];
    request.open('GET', PRICE_AT_DATE_URL_PARTS[0] + coingeckoDate + PRICE_AT_DATE_URL_PARTS[1]);
    request.send();

  }

  setTransactionValueAtDate(request, transactionId, date) {
    alert("response: " + request.responseText);
    let purchasePrice = Number(JSON.parse(request.responseText).market_data.current_price.usd);
    this.updateTransactions(transactionId, this.state.investmentData[transactionId].volume, date, purchasePrice);
  }

  updateTransactions(transactionId, volume, date, purchasePrice) {
    let transactions = this.state.transactions.slice();
    let profitData = this.state.profitData.slice();
    let investmentData = this.state.investmentData.slice();
    let purchasePrices = this.state.purchasePrices.slice();

    // If the id is higher than the last transaction in the array,
    // Then we must be creating a new Tx
    // The arrays must be augmented to make room for it
    if(transactionId > transactions.length-1){
      transactions.push({});
      profitData.push({});
      investmentData.push({});
      purchasePrices.push({});
    }

    purchasePrices[transactionId] = purchasePrice;

    investmentData[transactionId] = {
      volume: volume,
      date: date
    }

    alert("typeof volume: " + typeof(volume));
    alert("typeof this.state.currentPrice: " + typeof(this.state.currentPrice));
    alert("typeof purchasePrice: " + typeof(purchasePrice));

    let presentValue = volume * this.state.currentPrice;
    let purchaseValue = volume * purchasePrice;
    let valueChange = presentValue - purchaseValue;

    profitData[transactionId] = {
      valueAtPresent: presentValue.toFixed(2),
      valueAtPurchase: purchaseValue.toFixed(2),
      valueChange: valueChange.toFixed(2)
    };

    transactions[transactionId] = (
      <TransactionContainer
        id={transactionId}
        investmentData = {investmentData[transactionId]}
        profitData = {profitData[transactionId]}
        currentPrice = {this.state.currentPrice}
        handleVolumeChange={this.handleVolumeChange}
        handleDateChange={this.handleDateChange}
      />
    );

    this.setState(
      {
        transactions: transactions,
        investmentData: investmentData,
        profitData: profitData,
        purchasePrices: purchasePrices,
      },
      this.calculateNetChange.bind(this)
    );
  }

  updateCurrentMoneroPrice(request) {
    this.setState({
      currentPrice: JSON.parse(request.responseText).monero.usd
    })
  }

  // Make an HTTP request using the provided URL and run the provided
  // Callback functio when the server responds
  getCurrentMoneroPrice() {
    let request = new XMLHttpRequest();
    request.addEventListener('load', this.updateCurrentMoneroPrice.bind(this,request));
    request.open('GET', CURRENT_PRICE_API_URL);
    request.send();
  }

  calculateNetChange() {
    let netChange = 0;
    for(let i=0; i < this.state.profitData.length; i++){
      netChange += Number(this.state.profitData[i].valueChange);
    }
    //netChange = netChange.tofixed(2);
    this.setState({netChange: netChange.toFixed(2)});
  }

  getFakePurchasePrice() {
    return 50 + (Math.random() - 0.5) * 20
  }

  addTransaction(){
    this.updateTransactions(this.state.transactions.length, 0.00, this.convertDateToInputString(new Date()), this.state.currentPrice);
  }

  convertDateToInputString(date) {
    let month = date.getMonth() + 1;
    month < 10 ? month = "0" + month : month = "" + month;
    return date.getFullYear() + "-" + month + "-" + date.getDate();
  }

  handleVolumeChange(transactionId, volume) {
    this.updateTransactions(transactionId, Number(volume), this.convertDateToInputString(new Date()), this.state.purchasePrices[transactionId]);
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
    this.state = {
      investmentData: props.investmentData,
      profitData: props.profitData,
      currentPrice: props.currentPrice
    };
    this.onVolumeChange = this.onVolumeChange.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
  }

  onVolumeChange(event) {
    this.props.handleVolumeChange(this.props.id, event.target.value);
  }

  onDateChange(event) {
    this.props.handleDateChange(this.props.id, event.target.value);
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
