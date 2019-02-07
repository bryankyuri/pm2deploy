import React from "react";

function withSizmekTracker(WrappedComponent) {
  return class extends React.Component {
    componentDidMount() {
      if (process.env.REACT_APP_ENVIRONMENT === "production") {
        const oldSizmek = document.getElementById("ebOneTagUrlId");
        if (oldSizmek) oldSizmek.parentNode.removeChild(oldSizmek);

        const oldVersa = document.getElementById("ebOneTagUrlIdVersa");
        if (oldVersa) oldVersa.parentNode.removeChild(oldVersa);

        // EDIT THIS PART TO YOUR VERSA TAG
        const versaScriptContent = `var versaTag = {}; 
                  versaTag.id = ""; 
                  versaTag.sync = 0;
                  versaTag.dispType = "js"; 
                  versaTag.ptcl = "HTTPS";
                  versaTag.bsUrl = "bs.serving-sys.com/BurstingPipe";`;

        const versaScript = document.createElement("script");
        const versaScriptText = document.createTextNode(versaScriptContent);

        versaScript.id = "ebOneTagUrlIdVersa";
        versaScript.appendChild(versaScriptText);

        const sizmekScript = document.createElement("script");

        sizmekScript.id = "ebOneTagUrlId";
        sizmekScript.src =
          "https://secure-ds.serving-sys.com/SemiCachedScripts/ebOneTag.js";

        sizmekScript.async = true;
        document.body.appendChild(sizmekScript);
        document.body.appendChild(versaScript);
      }
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
}

export default withSizmekTracker;