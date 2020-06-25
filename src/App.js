import React from 'react';
import './App.css';

// Global constants
const CURRENT_PRICE_API_URL = "https://api.coingecko.com/api/v3/simple/price?ids=monero&vs_currencies=usd"
// This request URL is split in two because the appropriate date value must be inserted between them to
// form the complete date string
const PRICE_AT_DATE_URL_PARTS = ["https://api.coingecko.com/api/v3/coins/monero/history?date=","&localization=false"]

// change the color of the total profit/loss indicator based on whether the
// total is positive or negative
const POSITIVE_COLOR = "#00FF00"; // green
const NEGATIVE_COLOR = "#FF0000"; // red

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: [],
      investmentData: [],
      profitData: [],
      purchasePrices: [],
      currentPrice: 0.00, //Fake dummy price,
      netChange: 0.0,
      profitIsPositive: true
    }
    // Bind handlers
    this.addTransaction = this.addTransaction.bind(this);
    this.handleVolumeChange = this.handleVolumeChange.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.deleteTransaction = this.deleteTransaction.bind(this);
  }

  componentDidMount(){
    this.getCurrentMoneroPrice();
  }

  handleDateChange(transactionId, date){
    // Contingency: the date input has an option to "clear" the date, thus
    // Sending this function a null date variable which causes an error further
    // down the line.
    // If the user clears the date, we'll just reset it to the current date.
    if (date === "") {
      date = this.convertDateToInputString(new Date());
    // Make sure the user isn't in the middle of entering a date (ie )
    } else if (this.isDateValid(date)) {
      let request = new XMLHttpRequest();
      request.addEventListener('load', this.setTransactionValueAtDate.bind(this, request, transactionId, date));

      //Convert the date to a dd-mm-yyyy string for the coingecko API
      let coingeckoDate = date.substring(8) + date.substring(4,8) + date.substring(0,4);
      request.open('GET', PRICE_AT_DATE_URL_PARTS[0] + coingeckoDate + PRICE_AT_DATE_URL_PARTS[1]);
      request.send();
    } else {
      // The requested date pre-dates Monero's existence (or at least
      // coingecko's records)! So just reset the date field to it's previous
      // vlue (before the change attempt)
      this.updateTransactions(transactionId, this.state.investmentData[transactionId].volume, this.state.investmentData[transactionId].date, this.state.purchasePrices[transactionId]);
    }
  }

  isDateValid(date){
    let year = Number(date.substring(0,4));

    // The date as supplied may have single-digit month or day components
    // thus, the starting indices of each date component will vary.
    // we have to find the starting indices
    let monthEndIndex = date.substring(5).indexOf('-') + 5;
    let month = Number(date.substring(5,monthEndIndex));
    let dayStartIndex = monthEndIndex + 1;
    let day = Number(date.substring(dayStartIndex));

    // We also have to make sure the user isn't attempting to enter a date in the
    // future. We need today's date in order to check
    let today = new Date();
    let thisYear = Number(today.getFullYear());
    let thisMonth = Number(today.getMonth()+1);
    let thisDay = Number(today.getDate());
    if (
      (year < 2014) ||
      ((year === 2014) && (month < 5)) ||
      ((year === 2014) && (month === 5) && (day < 21))
    ) {
      alert("Invalid date! Coingecko does not report monero's value history before 05/21/2014");
    } else if (
      (year > thisYear) ||
      ((year === thisYear) && (month > thisMonth)) ||
      ((year === thisYear) && (month === thisMonth) && (day > thisDay))
    ) {
      alert("Invalid date! Coingecko cannot predict the future.");
    } else return true;

    return false;
  }

  setTransactionValueAtDate(request, transactionId, date) {
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

    let presentValue = volume * this.state.currentPrice;
    let purchaseValue = volume * purchasePrice;
    let valueChange = presentValue - purchaseValue;

    profitData[transactionId] = {
      valueAtPresent: presentValue.toFixed(2),
      valueAtPurchase: purchaseValue.toFixed(2),
      valueChange: valueChange.toFixed(2)
    };

    transactions[transactionId] = this.buildTransactionContainer(transactionId, investmentData[transactionId], profitData[transactionId]);

    let netChange = 0;
    for(let i=0; i < profitData.length; i++){
      netChange += Number(profitData[i].valueChange);
    }
    this.setState({
      transactions: transactions,
      investmentData: investmentData,
      profitData: profitData,
      purchasePrices: purchasePrices,
      netChange: netChange.toFixed(2)
    });
  }

  buildTransactionContainer(transactionId, investmentData, profitData) {
    return (
      <TransactionContainer
        key={transactionId}
        transactionId={transactionId}
        investmentData = {investmentData}
        profitData = {profitData}
        currentPrice = {this.state.currentPrice}
        handleVolumeChange={this.handleVolumeChange}
        handleDateChange={this.handleDateChange}
        deleteTransaction={this.deleteTransaction}
      />
    );
  }

  addTransaction(){
    this.updateTransactions(this.state.transactions.length, 0.00, this.convertDateToInputString(new Date()), this.state.currentPrice);
  }

  deleteTransaction(transactionId) {
    // -- FIX IDs --
    // removing an element will decrement the index of each element after it in
    // the list by 1. The transaction elements need to have their IDs updated
    // accordingly
    let transactions = this.state.transactions.slice();
    transactions.splice(transactionId, 1);
    for (var i = transactionId; i < transactions.length; i++) {
      transactions[i] = this.buildTransactionContainer(i, this.state.investmentData[transactionId + (i-transactionId) + 1], this.state.profitData[transactionId + (i-transactionId) +1]);
    }

    let investmentData = this.state.investmentData.slice();
    investmentData.splice(transactionId, 1);
    let profitData = this.state.profitData.slice();
    profitData.splice(transactionId, 1);
    let purchasePrices = this.state.purchasePrices.slice();
    purchasePrices.splice(transactionId, 1);
    this.setState({
      transactions: transactions,
      investmentData: investmentData,
      profitData: profitData,
      purchasePrices: purchasePrices,
      netChange: (this.state.netChange - Number(this.state.profitData[transactionId].valueChange)).toFixed(2)
    });
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
        <div className="PageTop">
          <div className="Header"><h1>Monero Profit Calculator</h1></div>
          <ProfitBox netChange = {this.state.netChange} />
        </div>
        <div className="TransactionArea">
          {this.state.transactions}
          <AppButton id="AddTransaction" onClick={this.addTransaction} symbol="+" />
        </div>
      </div>
    );
  }
}

function ProfitBox(props) {
  // The text color of the total profit/loss changes depending on whether the
  // net change is positive or negative
  // the colors are handled by the App.css file, where the "subclass" determines
  // whether to display red or green text
  return(
    <div className={"TotalProfit"} style={{color: props.netChange >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR}}>${props.netChange}</div>
  );
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
    this.deleteTransaction = this.deleteTransaction.bind(this);
  }

  onVolumeChange(event) {
    this.props.handleVolumeChange(this.props.transactionId, event.target.value);
  }

  onDateChange(event) {
    this.props.handleDateChange(this.props.transactionId, event.target.value);
  }

  deleteTransaction() {
    this.props.deleteTransaction(this.props.transactionId);
  }

  render() {
    return(
      <div className="Transaction">
        <div className="TransactionGrid">
          <div className="DeleteButton"><AppButton id="DeleteTransaction" onClick={this.deleteTransaction} symbol="X" /></div>
          <div className="VolumeEntry"><Prompt
            ref={(c) => this.volumeInput = c}
            type="number"
            name="Volume"
            size="12"
            value={this.props.investmentData.volume}
            onChange={this.onVolumeChange}
          /></div>
          <div className="DateEntry"><Prompt
            ref={(c) => this._dateInput = c}
            type="date"
            name="Date"
            value={this.props.investmentData.date}
            onChange={this.onDateChange}
          /></div>
        </div>
        <ProfitDataTable profitData={this.props.profitData} />
      </div>
    );
  };
}

function AppButton(props) {
  return(
    <button id={props.id} onClick={props.onClick}>{props.symbol}</button>
  );
}

class Prompt extends React.Component {
  render() {
    return(
    <div className={"Prompt " + this.props.className}>
      {this.props.name}: <input value = {this.props.value} type={this.props.type} name={this.props.name} size={this.props.size} onChange={this.props.onChange}/>
    </div>
    );
  }
}

function ProfitDataTable (props) {
  return (
    <div className="ProfitData">
      <div className="TableLabels">Purchase Value</div>
      <div className="TableLabels">Present Value</div>
      <div className="TableLabels">Profit/Loss: </div>
      <div className="TableValues">{props.profitData.valueAtPurchase}</div>
      <div className="TableValues">{props.profitData.valueAtPresent}</div>
      <div className="TableValues">{props.profitData.valueChange}</div>
    </div>
  );
}

export default App;
