import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import logo from './img/logo.png';
import Vacations from './Vacations';
import './App.css';

function Home() {
  return (
    <div>
      <h2>Welcome to Meadowlark Travel</h2>
      <p>
        Check out our "<Link to="/about">About</Link>" page!
      </p>
    </div>
  );
}

function About() {
  return <i>coming soon</i>;
}

function NotFound() {
  return <i>Not Found</i>;
}

function App() {
  return (
    <div className="container">
      <header>
        <h1>Meadowlark Travel</h1>
        <img src={logo} alt="Meadowlark Travel Logo" />
      </header>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/about" exact component={About} />
        <Route path="/vacations" exact component={Vacations} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

export default App;
