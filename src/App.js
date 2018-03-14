import React, { Component } from 'react';
import loadScript from 'load-script';
import './App.css';
import config from './config';
import EVENTS from './events-enums';

// Video Elem IDS
const LOCAL_VIDEO_ELEM_ID = 'skyjs-video-local';
const REMOTE_CONTAINER_ID = 'skyjs-remote-container'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      skylinkJSLoaded: false,
      activePeers: []
    }
    this.skylink = null;
  }
  componentDidMount() {
    loadScript(config.SRCIPT_CDN, (err, script) => {
      if (window.Skylink && typeof window.Skylink === 'function') {
        this.setState({ skylinkJSLoaded: true }, () => {
          this.initialize();
        });
      }
    })
  }
  popPeerFromState(peerID) {
    const { activePeers } = this.state;
    const peerIndex = activePeers.indexOf(peerID);
    peerIndex > -1 && activePeers.splice(peerIndex, 1);
    this.setState({ activePeers });
  }
  attachMediaStream(ELEM_ID, stream) {
    window.attachMediaStream && window.attachMediaStream(document.getElementById(ELEM_ID), stream);
  }
  onMediaAccessSuccess(component, stream) {
    component.attachMediaStream(LOCAL_VIDEO_ELEM_ID, stream);
  }
  onIncomingStream(component, peerId, stream, isSelf, peerInfo) {
    if (!isSelf) {
      const { activePeers } = component.state;
      if (activePeers.indexOf(peerId) === -1) {
        activePeers.push(peerId);
        component.setState({ activePeers }, () => {
          component.attachMediaStream(`remote_${peerId}`, stream);
        })
      }
    }
  }
  onStreamEnded(component, peerID, peerInfo, isSelf) {
    if (!isSelf) {
      component.popPeerFromState(peerID);
    }
  }
  onPeerLeft(component, peerID) {
    component.popPeerFromState(peerID);
  }
  refreshConnection(peerId) {
    this.skylink.refreshConnection(peerId)
  }
  initialize() {
    const component = this;
    this.skylink = new window.Skylink();
    this.skylink.on(EVENTS.MEDIA_ACCESS_SUCESS, this.onMediaAccessSuccess.bind(this, component));
    this.skylink.on(EVENTS.INCOMING_STREAM, this.onIncomingStream.bind(this, component));
    this.skylink.on(EVENTS.STREAM_ENDED, this.onStreamEnded.bind(this, component));
    this.skylink.on(EVENTS.PEER_LEFT, this.onPeerLeft.bind(this, component));

    const _s = this.skylink;
    _s.init(config, function (error, success) {
      if (success) {
        _s.joinRoom({
          audio: true,
          video: true
        });
      }
    });
  }

  render() {
    const { skylinkJSLoaded, activePeers } = this.state;
    if (!skylinkJSLoaded) return <h4>Loading SkylinkJS...</h4>
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Skylink JS Video Demo (@Ishan Naithani)</h1>
        </header>
        <div className="App-intro">
          <div className='video-container'>
            <div id='skyjs-video-container-local'>
              <div>
                <h3>Your Video</h3>
                <div>
                  <video id={LOCAL_VIDEO_ELEM_ID} autoPlay playsInline muted controls></video>
                </div>
              </div>
            </div>
            <div className='remote-container' id={REMOTE_CONTAINER_ID}>
              {
                !activePeers.length ? <h3>No peers connected yet!</h3> : <h3>Total Number of Active Peers: {activePeers.length} </h3>
              }
              {
                activePeers.map((peerId) => {
                  return <CreatePeerVideo
                    refreshConnection={this.refreshConnection.bind(this, peerId)}
                    peerId={peerId}
                    key={peerId}
                  />
                })
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const CreatePeerVideo = (props) => {
  const { peerId, refreshConnection } = props;
  return (
    <div>
      <h4>Peer ID : {peerId}</h4>
      <div>
        <video width='320' height='240' onClick={refreshConnection} id={`remote_${peerId}`} autoPlay playsInline muted controls></video>
      </div>
    </div>
  )
}

export default App;
