import React from 'react'
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
const { lazy, Suspense } = React;

import Loading from '@/components/loading/loading'

const TestComponent = lazy(() => import(/* webpackChunkName:"test" */'@/components/test'))
const Test = lazy(() => import(/* webpackChunkName:"test" */'@/views/test'))
const Home = lazy(() => import(/* webpackChunkName:"test" */'@/views/home'))


export default class App extends React.PureComponent {
  render() {
    return (
      <HashRouter basename="/">
        <Suspense fallback={<Loading />}>
          <Switch>
            <Route path='/testComponent' component={props => <TestComponent {...props} />}></Route>
            <Route path='/test' component={props => <Test {...props} />} ></Route>
            <Route path='/home' component={props => <Home {...props} />} ></Route>
            <Redirect to="/home" />
          </Switch>
        </Suspense>
      </HashRouter>
    )
  }
}