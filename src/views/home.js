import React from "react";
import { inject, observer } from "mobx-react"
import '../static/style/test.less'
import '../static/style/test_1.css'

@inject('BaseStore')
@observer
export default class extends React.PureComponent {

  constructor(props) {
    super(props);
    console.log(this.props)
    this.store = this.props.BaseStore;
  }

  componentDidMount() {
    console.log(this.store);
    this.store.handleTest();
  }

  render() {
    return (<div> home</div>)
  }

}