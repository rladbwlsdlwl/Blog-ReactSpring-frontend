import { useSearchParams } from "react-router-dom"
import "../css/signup.css"
import { useState, useContext, useEffect } from "react"
import { urlpath } from "../utils/apiUtils"
import axios from "axios"
import { AuthContext } from "../context/AuthProvider"

export default function Signup(){

    // 소셜 로그인 쿼리스트링
    const [query, setQuery] = useSearchParams()
    const email = query.get("email")

    
    const url = urlpath + "/signup"

    // input error setting
    const [errorMsg, setErrorMsg] = useState([])
    // success to signup
    const [successSignup, setSuccessSignup] = useState(false)

    // user input
    const [user, setUser] = useState({
        username: "",
        email: email || "",
        password: "",
        rePassword: ""
    })

    // 회원가입 성공
    useEffect(() => {

        if(successSignup){
            window.alert("회원가입 성공! 홈화면으로 이동합니다")
            window.location.pathname = "/"
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
        console.log(user)

        isValidInput()
    }

    function isValidInput(){
        // 비지니스 로직 
        // 아이디 이메일 비밀번호 패턴 확인
        if(user.password != user.rePassword){
            setErrorMsg([{message: "비밀번호가 일치하지 않습니다"}])
            
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
            console.log(res.data)

            setSuccessSignup(true)
        }).catch(e => {
            console.log(e)


            // error message setting  
            const dataMapper = (data) => {
                return data.message ? [{"message": data.message}] : data
            }

            const data = e.response.data
            setErrorMsg([...dataMapper(data)])
        })


    }

    console.log(email)
    return (
        <div className="signupContainer">
            {/* input box */}
             <div className="signupOuter">
                <div className="inputOuterBox">
                    <input className="inputBox" type = "text" placeholder="닉네임" name = "username" value = {user.username} onChange={handleUserSetting}></input>
                </div>
                <div className="inputOuterBox">
                    <input className="inputBox" type = "email" placeholder="이메일" name = "email" value = {user.email} onChange={handleUserSetting} readOnly = {email != null? true: false}></input>
                </div>
                <div className="inputOuterBox">
                    <input className="inputBox" type = "password" placeholder="패스워드" name = "password" value = {user.password} onChange={handleUserSetting}></input>
                </div>
                <div className="inputOuterBox">
                    <input className="inputBox" type = "password" placeholder="패스워드를 다시 입력하세요" name = "rePassword" value = {user.rePassword} onChange={handleUserSetting}></input>
                </div>
                <div className="inputOuterBox">
                    {
                        errorMsg.map((data, index) => <div key = {`errormessage ${index}`}> {data.field} {data.message} </div>)
                    }
                </div>
                <div className="inputOuterBox">
                    <input className="inputBox" type="submit" onClick={submitHandler}></input>
                </div>
            </div>
        </div>
       
    )
}