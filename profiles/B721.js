
module.exports = {
  drNvar: [
    {
      value: 0,
      dref: 'FJS/732/Annun/SysAnnunLIT_50',
      process: (profile, value) => value >= 0.5,
      freq: 1
    }, {
      value: 0,
      dref: 'FJS/732/Annun/SysAnnunLIT_52',
      process: (profile, value) => value >= 0.5,
      freq: 1
    }, {
      value: 0,
      dref: 'FJS/732/Annun/SysAnnunLIT_53',
      process: (profile, value) => value >= 0.5,
      freq: 1
    }, {
      value: 0,
      dref: 'FJS/732/Annun/SysAnnunLIT_51',
      process: (profile, value) => value >= 0.5,
      freq: 1
    }, {
      value: 0,
      dref: 'FJS/732/Annun/SysAnnunLIT_54',
      process: (profile, value) => value >= 0.5,
      freq: 1
    }, {
      value: 0,
      dref: 'FJS/732/Annun/SysAnnunLIT_55',
      process: (profile, value) => value >= 0.5,
      freq: 1
    }, {
      value: 1,
      dref: 'FJS/727/Hyd/GearHandleMo',
      process: (profile, value) => {
        return Math.floor(value + 0.5) - 1;
      },
      freq: 1
    },
    {
      value: -1,
      process: (profile) => {
        return (2 * profile.drNvar[0].value * profile.drNvar[1].value * profile.drNvar[2].value) + (profile.drNvar[3].value * profile.drNvar[4].value * profile.drNvar[5].value);
      },
      execute: (profile, vjDevice, commClient, drNvar) => {
        // console.log(drNvar.value)
        switch (drNvar.value) {
          case 1:
            commClient.gearPanel.send('DN&LOCKED');
            break;
          case 2:
            commClient.gearPanel.send('IN TRANSIT');
            break;
          case 3:
            commClient.gearPanel.send('OFF&UNLCKD');
            break;
          default:
            if (profile.drNvar[6].value === -1) commClient.gearPanel.send('UP&LOCKED');
            else if (profile.drNvar[6].value === 0) commClient.gearPanel.send('');
            break;
        }
      },
      device: 'gearPanel'
    }
  ],
  command: {
    1: (profile, udpClient) => {
      udpClient.executeCommand('sim/flight_controls/landing_gear_up');
    },
    2: (profile, udpClient) => {
      udpClient.executeCommand('sim/flight_controls/landing_gear_down');
    },
    0: (profile, udpClient) => {
      if (profile.drNvar[6].value === 1) udpClient.executeCommand('FJS/727/Hyd/Com/GearHandleTuggle');
    }
  }
};
