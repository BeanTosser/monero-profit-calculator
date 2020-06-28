import React from 'react';
import './CurrencyInput.css';

class CurrencyInput extends React.Component {
  constructor(props) {
    super(props);
    this.formattedValue = this.formatToDecimal(this.currencyValue);
    this.onChange = this.onChange.bind(this);
  }

  formatToDecimal(num){
    return parseFloat(num).toFixed(parseFloat(this.props.decimalPlaces));
  }

  onChange(event){
    let formattedValue = parseFloat(event.target.value).toFixed(this.props.decimalPlaces);
    this.props.onChange(event, formattedValue);
  }

  render() {
    return(
      <span className={"CurrencyInput " + this.props.className}>
        {this.props.currencySymbol}<input value = {this.formatToDecimal(this.props.value)} type="number" name={this.props.name} size={this.props.size} onChange={this.onChange} step={1 * 10**-this.props.decimalPlaces}/>
      </span>
    );
  }
}

export default CurrencyInput;
