import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HttpHeaderProvider from './context/HttpHeaderProvider';

import Home from './component/Home';
import Login from './component/Login';
import Header from "./component/common/Header"
import Signup from './component/Signup';
import UserHome from './component/UserHome';

function App() {
  return (
    <div>
      <HttpHeaderProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path = "/" element = {<Home />}></Route>
          <Route path = "/login" element = {<Login />}></Route>
          <Route path = "/signup" element = {<Signup />}></Route>
          <Route path = "/:username" element = {<UserHome />}></Route>
        </Routes>
      </BrowserRouter>
      </HttpHeaderProvider>
    </div>
  );
}


export default App;
