import school from './img/school.jpg'

const Home = () => {
    return (
        <div className='card shadow-lg' style={{ width: "100vw", height: "100vh" }}>
            <h1 className='text-center m-5'>Continuous feedback</h1>
            <img width="100%" height="100%" src={school}></img>
        </div>
    );
};

export default Home;