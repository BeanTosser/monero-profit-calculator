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
      currentPrice: 55.23, //Fake dummy price,
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
    let urlString = PRICE_AT_DATE_URL_PARTS[0] + coingeckoDate + PRICE_AT_DATE_URL_PARTS[1];
    request.open('GET', PRICE_AT_DATE_URL_PARTS[0] + coingeckoDate + PRICE_AT_DATE_URL_PARTS[1]);
    request.send();

  }

  setTransactionValueAtDate(request, transactionId, date) {
    let valueAtDate = Number(JSON.parse(request.responseText).market_data.current_price.usd);

    let transactions = this.state.transactions.slice();
    let profitData = this.state.profitData.slice();
    let investmentData = this.state.investmentData.slice();
    let purchasePrices = this.state.purchasePrices.slice();

    purchasePrices[transactionId] = valueAtDate;

    investmentData[transactionId] = {
      volume: investmentData[transactionId].volume,
      date: date
    };

    let valueAtPresent = investmentData[transactionId].volume * this.state.currentPrice;
    let valueAtPurchase = investmentData[transactionId].volume * valueAtDate;
    let valueChange = valueAtPresent - valueAtPurchase;
    profitData[transactionId] = {
      valueAtPresent: valueAtPresent.toFixed(2),
      valueAtPurchase: valueAtPurchase.toFixed(2),
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

    // When adding a new Tx, the default date for the Tx is today, so there
    // is no need to fetch the historical price data.
    purchasePrices.push(this.state.currentPrice);

    let valueAtPurchase = (investmentData[investmentData.length-1].volume * purchasePrices[purchasePrices.length-1]);
    let valueAtPresent = (investmentData[investmentData.length-1].volume * this.state.currentPrice);
    let valueChange = (valueAtPresent - valueAtPurchase);

    profitData.push({
      valueAtPurchase: valueAtPurchase.toFixed(2),
      valueAtPresent: valueAtPresent.toFixed(2),
      valueChange: valueChange.toFixed(2)
    });
    transactions.push(<TransactionContainer
      id={transactions.length}
      investmentData = {investmentData[investmentData.length-1]}
      profitData = {profitData[profitData.length-1]}
      currentPrice = {this.state.currentPrice}
      handleVolumeChange={this.handleVolumeChange}
      handleDateChange={this.handleDateChange}
    />);
    this.setState(
      {
        transactions: transactions,
        investmentData: investmentData,
        profitData: profitData,
        purchasePrices: purchasePrices,
      }
    );
  }

  convertDateToInputString(date) {
    let month = date.getMonth() + 1;
    month < 10 ? month = "0" + month : month = "" + month;
    return date.getFullYear() + "-" + month + "-" + date.getDate();
  }

/*
  // This is code that is _almost_ entirely shared by handleVolumChange()
  // and handleDateChange(). It has been extracted to avoid unnecessary code
  // repetition
  // value: if isChangingVolume, value is the volume
  // otherwise, value is the purchasePrice
  updateChildren(transactionId, value, isChangingVolume, date) {
    let investmentData = this.state.investmentData.slice();
    let profitData = this.state.profitData.slice();
    let transactions = this.state.transactions.slice();

    investmentData[transactionId] = {
      volume: isChangingVolume ? value : investmentData[transactionId].volume,
      date: isChangingVolume ? investmentData[transactionId].date : date
    };

    let valueAtPresent = volume * this.state.currentPrice;
    let valueAtPurchase = isChangingVolume ? this.state.purchasePrices[transactionId] : this * this.state.purchasePrices[transactionId] : value * ;
    profitData[transactionId] = {
      valueAtPurchase: valueAtPurchase.toFixed(2),
      valueAtPresent: valueAtPresent.toFixed(2),
      valueChange: (valueAtPresent - valueAtPurchase).toFixed(2)
    }

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

    this.setState({
      investmentData: investmentData,
      profitData: profitData,
      transactions: transactions
    }, () => {
    });
  }
*/

  handleVolumeChange(transactionId, volume) {
    let investmentData = this.state.investmentData.slice();
    let profitData = this.state.profitData.slice();
    let transactions = this.state.transactions.slice();

    investmentData[transactionId] = {
      volume: volume,
      date: investmentData[transactionId].date
    };

    let valueAtPurchase = volume * this.state.purchasePrices[transactionId];
    let valueAtPresent = volume * this.state.currentPrice;
    profitData[transactionId] = {
      valueAtPurchase: valueAtPurchase.toFixed(2),
      valueAtPresent: valueAtPresent.toFixed(2),
      valueChange: (valueAtPresent - valueAtPurchase).toFixed(2)
    }

    transactions[transactionId] = (
      <TransactionContainer
        id={transactionId}
        investmentData = {investmentData[transactionId]}
        profitData = {profitData[transactionId]}
        currentPrice = {this.state.currentPrice}
        purchasePrices = {this.state.purchasePrices}
        handleVolumeChange={this.handleVolumeChange}
        handleDateChange={this.handleDateChange}
      />
    );

    this.setState(
      {
        transactions: transactions,
        investmentData: investmentData,
        profitData: profitData,
      },
      this.calculateNetChange.bind(this)
    );
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
