import React from 'react'
import { Provider } from 'mobx-react';
import reactDom from 'react-dom';

import App from "../src/router/index"
import stores from "@/store/index"

import './static/style/common.less'

let BaseReact =()=> {
  return (
      <Provider {...stores}>
          <App />
      </Provider>
  );
}

reactDom.render(BaseReact(), document.getElementById('app'))