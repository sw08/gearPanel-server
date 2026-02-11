
module.exports = {
  drNvar: [{
    value: 0,
    dref: 'sim/cockpit2/annunciators/gear_unsafe',
    freq: 1
  }, {
    value: 1,
    dref: 'cust/t134/control/gear_hdl_pos',
    freq: 1
  },
  {
    value: -1,
    process: (profile) => {
      if (profile.drNvar[0].value) {
        return 3;
      } else {
        return profile.drNvar[1].value;
      }
    },
    execute: (profile, vjDevice, commClient, drNvar) => {
      // console.log(drNvar.value)
      switch (drNvar.value) {
        case 0:
          commClient.gearPanel.send('UP&LOCKED');
          break;
        case 1:
          commClient.gearPanel.send('');
          break;
        case 2:
          commClient.gearPanel.send('DN&LOCKED');
          break;
        case 3:
          commClient.gearPanel.send('IN TRANSIT');
          break;
      }
    },
    device: 'gearPanel'
  }

  ],
  command: {
    1: (profile, udpClient) => {
      udpClient.executeCommand('SCS/t134/commands/gear_hndl_up');
    },
    2: (profile, udpClient) => {
      udpClient.executeCommand('SCS/t134/commands/gear_hndl_down');
    },
    0: (profile, udpClient) => {
      if (profile.drNvar[1].value === 2) {
        udpClient.executeCommand('SCS/t134/commands/gear_hndl_toggle_up');
      } else if (profile.drNvar[1].value === 0) {
        udpClient.executeCommand('SCS/t134/commands/gear_hndl_toggle_down');
      }
    }
  }
};
