import axios from 'axios'
import {useContext, useState} from 'react'
import { AuthContext } from '../context/AuthProvider'

export default function Login(){
    const googleurl = "http://localhost:8080/oauth2/authorization/google"
    
    return (
        <div>
            <a href = {googleurl}>google login</a>
        </div>
    )
}