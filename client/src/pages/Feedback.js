import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import amazeImg from './img/amaze.png'
import frownyImg from './img/frowny.png'
import confusedImg from './img/confused.png'
import smileyImg from './img/smiley.png'

const Feedback = () => {
    const [feedbackInstances, setFeedbackInstances] = useState([]);
    const { id } = useParams();
    const [activity, setActivity] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        async function fetchActivity() {
            const res = await fetch('http://localhost:3001/activities/' + id, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem("token")
                },
            });
            if (res.ok) {
                const data = await res.json();
                setActivity(data);
            }
        };

        async function fetchFeedbacks() {
            const res = await fetch('http://localhost:3001/feedbacks/activity/' + id, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem("token")
                },
            });
            const data = await res.json();
            if (res.ok) {
                setFeedbackInstances(data);
            }
        };

        if (token) {
            try {
                const data = jwtDecode(token);
                if (data.type != "teacher") navigate("/home");
                fetchActivity();
                fetchFeedbacks();
            } catch (e) {
                localStorage.removeItem('token');
                navigate("/login");
            }
        }
    }, []);

    const returnEmoji = reaction => {
        if (reaction === 'smiley') {
            return <img width="50px" height="50px" src={smileyImg}></img>
        }
        if (reaction === 'frowny') {
            return <img width="50px" height="50px" src={frownyImg}></img>
        }
        if (reaction === 'surprised') {
            return <img width="50px" height="50px" src={amazeImg}></img>
        }
        if (reaction === 'confused') {
            return <img width="50px" height="50px" src={confusedImg}></img>
        }
    }

    return (
        <div className='m-5'>
            {/* Display Activity Details */}
            <div className="card shadow-lg m-5">
                <div className="card-body">
                    <h5 className="card-title">{activity.title}</h5>
                    <hr></hr>
                    <p className="card-text">Description: {activity.description}</p>
                    <p className="card-text">Code: {activity.code}</p>
                    <p className="card-text">Date: {new Date(activity.date).toLocaleDateString() + ", " + new Date(activity.date).toLocaleTimeString()}</p>
                </div>
            </div>

            {/* Display Feedback Instances */}
            <div>
                <h3>Feedback Instances:</h3>
                {feedbackInstances.length <= 0 && <h4>You did not receive any feedback.</h4>}
                {feedbackInstances.map((feedback, index) => (
                    <div key={index}>
                        <p>{returnEmoji(feedback.type)} - {new Date(feedback.date).toDateString()}, {new Date(feedback.date).toLocaleTimeString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Feedback;