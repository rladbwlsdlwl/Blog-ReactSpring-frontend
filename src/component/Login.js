import axios from 'axios'
import { useContext, useState } from 'react'
import { urlpath } from '../utils/apiUtils'
import googleImg from "../images/google.png"
import naverImg from "../images/naver.png"
import "../css/login.css"
import "../css/common.css"
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthProvider'
import { getErrorMsg } from '../utils/commonUtils'

export default function Login(){
    const googleurl = "https://port-0-blog-reactspring-backend-prod-m2k9xlt5e613b758.sel4.cloudtype.app/oauth2/authorization/google"
    const naverurl = "https://port-0-blog-reactspring-backend-prod-m2k9xlt5e613b758.sel4.cloudtype.app/oauth2/authorization/naver"
    const url = urlpath + "/signin"

    const { settingToken } = useContext(AuthContext)


    const [errorMsg, setErrorMsg] = useState("")
    const [user, setUser] = useState({
        username: "",
        password: ""
    })



    function handleUserSetting(e){
        const {name, value} = e.target

        setUser({...user, [name]: value})
    }

    function submitHandler(){
        const data = {
            name: user.username,
            password: user.password
        }

        axios.post(url, data).then(res => {
            // header 값 저장
            const headers = res.headers
            const token = headers["authentication"] || headers["Authentication"] // 소문자로 들어옴..

            settingToken(token)
            
            // 로그인 성공 알럿, 홈 화면 전환
            window.alert("로그인 성공! 홈 화면으로 이동합니다")
            window.location.pathname = "/"
        }).catch(err => {
            console.log(err)
            const msg = getErrorMsg(err)

            window.alert(msg)
            setErrorMsg(msg)
        })
    }
    return (
        <div className = "signinContainer">
            <div className = "signinOuter">
                <div className = "inputOuterBox">
                    <div className='inputOuterBox'>
                        아이디/닉네임
                    </div>
                    <input className='inputBox' type = "text" placeholder='닉네임을 입력하세요' name = "username" value = {user.username} onChange = {handleUserSetting} onKeyDown = {(e) => e.key == "Enter" && submitHandler()}></input>
                </div>
                <div className = 'inputOuterBox'> 
                    <div className='inputOuterBox'>
                        비밀번호
                    </div>
                    <input className='inputBox' type = "password" placeholder='비밀번호를 입력하세요' name = "password" value = {user.password} onChange = {handleUserSetting} onKeyDown = {(e) => e.key == "Enter" && submitHandler()}></input>
                </div>
                
                {/* 에러 메세지 */}
                <div style = {{height: "50px"}}>
                    {errorMsg}
                </div>
                

                {/* 로그인 버튼 */}
                <div className = 'inputOuterBox'>
                    <input className = "inputBox" type = "submit" value = "로그인" onClick = {submitHandler}></input>
                </div>

                {/* 유틸리티 버튼 */}
                <div className = 'inputOuterBox utilOuter'>
                    <div className="util">
                        <Link to = "/auth/login/findname" className = "link utilInner">
                            아이디 찾기
                        </Link>
                    </div>
                    <div className="util">
                        <Link to = "/auth/login/findpassword" className = "link utilInner">
                            비밀번호 찾기
                        </Link>
                    </div>
                    <div className="util">
                        <Link to = "/auth/signup" className = "link utilInner">
                            회원가입
                        </Link>
                    </div>
                </div>

                {/* 소셜 로그인 버튼 */}
                <div className='inputOuterBox'>
                    <img src = {googleImg} onClick = {() => window.location.href = googleurl} className = "socialLoginImage"/>
                    <img src = {naverImg} onClick = {() => window.location.href = naverurl} className = "socialLoginImage"/>
                </div>
            </div>


            
        </div>
    )
}