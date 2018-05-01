import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import CreatePage from './CreatePage'
import { BrowserRouter, Switch, Route } from 'react-router-dom';
ReactDOM.render(
    <BrowserRouter>
        <Switch>
            <Route path="/" exact component={ App } />
            <Route path="/create" component={ CreatePage } />
        </Switch>
    </BrowserRouter>
  , document.getElementById('root')
)