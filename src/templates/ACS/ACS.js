import React from "react";
import Webcam from "react-webcam";

class ACS extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imagePreview: ""
    };
  }

  setRef = webcam => {
    this.webcam = webcam;
  };

  capture = () => {
    const imageSrc = this.webcam.getScreenshot();
    this.setState({
      imagePreview: imageSrc
    });
  };

  isHaveCamera = () =>
    !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  render() {
    // const videoConstraints = {
    //   // width: 1280,
    //   // height: 720,
    //   facingMode: "user"
    // };

    return (
      <div>
        {this.isHaveCamera() ? (
          <>
            <img src={this.state.imagePreview} />
            <Webcam
              audio={false}
              width={350}
              height={350}
              ref={this.setRef}
              screenshotFormat="image/jpeg"
              // videoConstraints={videoConstraints}
            />
            <button onClick={this.capture}>Capture photo</button>
          </>
        ) : (
          <div>ceritanya Upload FIle</div>
        )}
      </div>
    );
  }
}

export default ACS;