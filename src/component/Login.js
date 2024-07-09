import axios from 'axios'
import {useState, useEffect} from 'react'

export default function Login(){
    const googleurl = "http://localhost:8080/oauth2/authorization/google"
    function loadOAuthLogin(url){
        axios.get(url)
        .then((res) => {
            const token = res.headers.get("Authentication")
            console.log(res.data)
            console.log(res.headers.get("Authentication"))

            if(token != null){
                console.log(`토큰 발행 확인! 홈화면으로 이동합니다 - ${token}`)
                window.href = "http://localhost:3000"
            }
        }).catch(err => {
            console.log(err)
        })
    }

    return (
        <div>
            <a href = {googleurl}>google login</a>
        </div>
    )
}