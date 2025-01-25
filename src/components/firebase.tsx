import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { IActivityLog } from "./Interfaces/IActivityLog";
import { IFirebaseConfig } from "./Interfaces/IFirebaseConfig";
// import { getStorage, ref, uploadBytes, listAll, getDownloadURL, getMetadata, deleteObject  } from "firebase/storage";




const firebaseConfig:IFirebaseConfig = {
    apiKey: "AIzaSyAHAGP8BdybmS11DOXkFZ9up-fGeI7QoK0",
    authDomain: "akcessible-e6abf.firebaseapp.com",
    projectId: "akcessible-e6abf",
    storageBucket: "akcessible-e6abf.firebasestorage.app",
    messagingSenderId: "325202187935",
    appId: "1:325202187935:web:bea1dc8fb6ce3779adf4aa",
    measurementId: "G-9HMVG8FRE6"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


/*
    Each button reports the session time stamp to this function to store it in the proper folder
    This function adds the time stamp of the click (with create_click_timestamp())

    Database:
    session_time_stamp_string_0 -> click_timestamp_0 -> data
                                -> click_timestamp_1 -> data
                                -> click_timestamp_2 -> data

    session_time_stamp_string_1 -> click_timestamp_0 -> data
                                -> click_timestamp_1 -> data
                                -> click_timestamp_2 -> data
*/
export function registerActivity(session_time_stamp_string:string, data:IActivityLog){ 
    return new Promise((resolve, reject) => { 
        setDoc(doc(db, session_time_stamp_string, create_click_timestamp(new Date())), data, { merge: true })
        .then(() => resolve(true))
        .catch((error) => reject(error));
    })
}

function create_click_timestamp(date: Date){
    // Get parts of the date
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    // Determine AM or PM
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    const formattedTime = `${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
    return `${year}-${month}-${day}, ${formattedTime}`;
};

async function getIpAddress() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Error fetching IP address:', error);
    }
}

// Example usage
getIpAddress().then(ip => console.log('IP Address:', ip));


export function createNewSession(time_stamp_string:string) {
    // adds a session blob
    console.log(time_stamp_string);
    return new Promise((resolve, reject) => {
        getIpAddress().then(
            (ip:string) => {
            const newSessionDoc = doc(db, time_stamp_string, time_stamp_string);
            setDoc(newSessionDoc, { creationTime: time_stamp_string, ip: ip }, { merge: true })
                .then(() => resolve(true))
                .catch((error) => reject(error));
        
        });
    });
}

export default firebase;