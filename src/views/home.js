import React from "react";
import { inject, observer } from "mobx-react"
import '../static/style/test.less'
import '../static/style/test_1.css'

import baseUrl from "@/utils/setbaseUrl"

@inject('BaseStore')
@observer
export default class extends React.PureComponent {

  constructor(props) {
    super(props);
    this.store = this.props.BaseStore;
  }

  componentDidMount() {
    this.store.handleTest();
  }

  render() {
    return (<div> home</div>)
  }

}