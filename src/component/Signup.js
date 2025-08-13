import { useNavigate, useSearchParams } from "react-router-dom"
import "../css/Signup.css"
import { useState, useContext, useEffect } from "react"
import { urlpath } from "../utils/apiUtils"
import axios from "axios"
import { AuthContext } from "../context/AuthProvider"
import { getErrorMsg } from "../utils/commonUtils"

export default function Signup(){
    const url = urlpath + "/signup"
    const navigate = useNavigate()


    // input error setting
    const [errorMsg, setErrorMsg] = useState([])
    // success to signup
    const [successSignup, setSuccessSignup] = useState(false)

    // user input
    const [user, setUser] = useState({
        username: "",
        email: "",
        password: "",
        rePassword: ""
    })

    // 회원가입 성공
    useEffect(() => {

        if(successSignup){
            window.alert("회원가입 성공! 홈화면으로 이동합니다")
            navigate("/")
        }

    }, [successSignup])

    // 인풋 핸들러
    function handleUserSetting(e){
        const {name, value} = e.target

        setUser({
            ...user,
            [name]: value
        })
    }

    // 제출 핸들러
    function submitHandler(){
        validationPassword()
    }

    function validationPassword(){
        // 비지니스 로직 
        // 아이디 이메일 비밀번호 패턴 확인
        if(user.password != user.rePassword){
            window.alert("password: 비밀번호가 일치하지 않습니다")
            setErrorMsg(["password: 비밀번호가 일치하지 않습니다"])
            
            return 
        }

        createUser()
    }

    function createUser(){
        const data = {
            name: user.username,
            password: user.password,
            email: user.email
        }

        axios.post(url, data).then((res) => {
            
            setSuccessSignup(true)
        
        }).catch(e => {
            const msg = getErrorMsg(e)

            window.alert(msg)
            setErrorMsg(msg.split("\n"))
        })
    }

    // console.log(email)
    return (
        <div className="signupContainer">
            {/* input box */}
             <div className="signupOuter">
                <div className="inputOuterBox">
                    <input className="inputBox" type = "text" placeholder="닉네임" name = "username" value = {user.username} onChange={handleUserSetting} onKeyDown = {(e) => e.key == "Enter" && submitHandler()}></input>
                </div>
                <div className="inputOuterBox">
                    <input className="inputBox" type = "email" placeholder="이메일" name = "email" value = {user.email} onChange={handleUserSetting} onKeyDown = {(e) => e.key == "Enter" && submitHandler()}></input>
                </div>
                <div className="inputOuterBox">
                    <input className="inputBox" type = "password" placeholder="패스워드" name = "password" value = {user.password} onChange={handleUserSetting} onKeyDown = {(e) => e.key == "Enter" && submitHandler()}></input>
                </div>
                <div className="inputOuterBox">
                    <input className="inputBox" type = "password" placeholder="패스워드를 다시 입력하세요" name = "rePassword" value = {user.rePassword} onChange={handleUserSetting} onKeyDown = {(e) => e.key == "Enter" && submitHandler()}></input>
                </div>
                <div className="inputOuterBox">
                    {
                        errorMsg.map((data, index) => <div key = {`errormessage ${index}`}> { data } </div>)
                    }
                </div>
                <div className="inputOuterBox">
                    <input className="inputBox" type="submit" onClick={submitHandler}></input>
                </div>
            </div>
        </div>
       
    )
}