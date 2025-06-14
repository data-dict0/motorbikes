import logo from './logo.svg';
import './App.css';
import ChartHead from './components/ChartHead';
import LottieScroller from './components/LottieScroller';
import animationData from './lottie/topper/data-2.json';

function App() {
  return (
    <div>
      <ChartHead />
<LottieScroller 
  animationData={animationData} // optional, uses default if not provided
/>

   {/* Vertical content section */}
      <section style={{
        position: 'relative',
        marginLeft: 'auto',
        marginRight: 'auto',
        maxWidth: '800px',
      }}>
        <div className='BodyText'>
          <p>Either way, analysts said the age composition of those sitting at the current Lower House, and people running to replace them, reveal an inconvenient truth: a limited pool of options for voters and a strong grip of political dynasties in Philippine politics.</p>
        </div>

        <div className='BodyText'>
          <p>"Conventional thinking would point to age as a factor," said Michael Henry Yusingco, a senior research fellow at the Ateneo Policy Center, a think tank. "Public office is generally seen as a job for mature persons. And the default measure for maturity is age."</p>
        </div>

        <div className='BodyText'>
          <p>The median age of candidates for district representatives this year is at 55 years old, higher than the current median age of 51 for the current members of the House, our analysis showed. These numbers are generally comparable to most countries in the region, including Indonesia (51.6 years) and Thailand (50.9 years), according to Geneva-based Inter-Parliamentary Union that tracks parliaments and congresses.</p>
        </div>

      </section>
    </div>
  );
}

export default App;
