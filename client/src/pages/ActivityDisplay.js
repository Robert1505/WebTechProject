import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import amazeImg from './img/amaze.png'
import frownyImg from './img/frowny.png'
import confusedImg from './img/confused.png'
import smileyImg from './img/smiley.png'

const ActivityDisplay = () => {
    const [feedbackInstances, setFeedbackInstances] = useState([]);
    const { id } = useParams();
    const [user, setUser] = useState({});
    const [refresh, setRefresh] = useState(false);
    const [activity, setActivity] = useState();
    const [available, setAvailable] = useState(false);
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
                const data = await res.json()
                setActivity(data)
                const currentDate = new Date();
                const activityDate = new Date(data.date);
                const activityDurationMs = 90 * 60 * 1000;
                const currentDateUTC = currentDate.toISOString();
                console.log(currentDateUTC > new Date(activityDate.getTime() + activityDurationMs).toISOString())
                if (currentDateUTC > new Date(activityDate.getTime() + activityDurationMs).toISOString()) {
                    setAvailable(false);
                } else setAvailable(true)
            }
        };

        async function fetchFeedbacks() {
            const res = await fetch('http://localhost:3001/feedbacks/activity/' + id, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem("token")
                },
            });
            const data = await res.json()
            if (res.ok) {
                setFeedbackInstances(data)
            }
        };

        if (token) {
            try {
                const data = jwtDecode(token);
                setUser(data.user);
                if (data.type != "student") navigate("/home");
                fetchActivity();
                fetchFeedbacks();
            } catch (e) {
                localStorage.removeItem('token');
                navigate("/login");
            }
        }
    }, [refresh]);

    const addFeedback = (reaction) => {
        fetch(`http://localhost:3001/feedbacks/users/${user.id}/activities/${activity.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem("token")
            },
            body: JSON.stringify({
                userId: user.id, type: reaction, date: new Date()
            }),
        })
            .then((response) => {
                if (response.ok) {
                    setRefresh(!refresh);
                } else {
                    throw new Error('Error adding feedback!');
                }
            })
            .catch((error) => {
                alert('Error adding feedback!');
            });
    };

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
        <>
            {available ? <div className='m-5'>
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

                <h3>Send your feedback!</h3>
                <div className='emoticon-container'>
                    <div className='row'>
                        <div className='col-6 border shadow'>
                            <button className='emoticon-button' onClick={() => addFeedback('smiley')}>
                                <img width="100px" height="100px" src={smileyImg}></img>
                            </button>
                        </div>
                        <div className='col-6 border shadow'>
                            <button className='emoticon-button' onClick={() => addFeedback('frowny')}>
                                <img width="100px" height="100px" src={frownyImg}></img>
                            </button>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-6 border shadow'>
                            <button className='emoticon-button' onClick={() => addFeedback('surprised')}>
                                <img width="100px" height="100px" src={amazeImg}></img>
                            </button>
                        </div>
                        <div className='col-6 border shadow'>
                            <button className='emoticon-button' onClick={() => addFeedback('confused')}>
                                <img width="100px" height="100px" src={confusedImg}></img>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Display Feedback Instances */}
                <div>
                    <h3>Feedback Instances:</h3>
                    {feedbackInstances.length <= 0 && <h4>You did not send any feedback.</h4>}
                    {feedbackInstances.map((feedback, index) => (
                        <div key={index}>
                            <p>{returnEmoji(feedback.type)} - {new Date(feedback.date).toDateString()}, {new Date(feedback.date).toLocaleTimeString()}</p>
                        </div>
                    ))}
                </div>
            </div> : <div className='m-5'>
                <h1>This activity is not accessible anymore.</h1>
            </div>}
        </>
    );
};

export default ActivityDisplay;