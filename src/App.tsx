import React from 'react';
import './App.css';

export default class App extends React.Component {
  state = {
    apiToken: logseq.settings?.apiToken,
    projectIdWithPrefix: logseq.settings?.projectIdWithPrefix,
    projectIdWithoutPrefix: logseq.settings?.projectIdWithoutPrefix,
    clearTasks: logseq.settings?.clearTasks,
  };

  componentDidMount = () => {
    logseq.updateSettings({
      clearTasks: true,
    });
  };

  handleInput = (e: any) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleCheckbox = (e: any) => {
    if (e.target.checked) {
      this.setState({
        [e.target.name]: true,
      });
    } else {
      this.setState({
        [e.target.name]: false,
      });
    }
  };

  hide = () => {
    logseq.hideMainUI();
  };

  saveAndClose = () => {
    logseq.hideMainUI();
    logseq.updateSettings(this.state);
  };

  render() {
    return (
      <React.Fragment>
        <div id="wrapper">
          <div id="todoist-settings">
            <h3>
              Refer to the{' '}
              <a href="https://github.com/hkgnp/logseq-todoist-plugin">
                Readme
              </a>{' '}
              for instructions on how to complete the below
            </h3>
            <form>
              <p>
                <label htmlFor="apiToken">API Token</label>:
                <input
                  type="text"
                  name="apiToken"
                  value={this.state.apiToken}
                  onChange={this.handleInput}
                />
              </p>
              <p>
                <label htmlFor="projectIdWithPrefix">
                  Project ID With Prefix
                </label>
                :
                <input
                  type="text"
                  name="projectIdWithPrefix"
                  value={this.state.projectIdWithPrefix}
                  onChange={this.handleInput}
                />
              </p>
              <p>
                <label htmlFor="projectIdWithoutPrefix">
                  Project ID Without Prefix
                </label>
                :
                <input
                  type="text"
                  name="projectIdWithoutPrefix"
                  value={this.state.projectIdWithoutPrefix}
                  onChange={this.handleInput}
                />
              </p>
              <p>
                <label htmlFor="clearTasks">Clear Tasks?</label>
                :
                <input
                  type="checkbox"
                  name="clearTasks"
                  checked={this.state.clearTasks}
                  onChange={this.handleCheckbox}
                />
              </p>
            </form>
            <button onClick={this.hide}>Exit w/o Saving</button>
            <button onClick={this.saveAndClose}>Save & Close</button>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
