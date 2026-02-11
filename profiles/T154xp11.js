
module.exports = {
  drNvar: [
    {
      value: 0,
      dref: 'sim/custom/lights/gears_red_front',
      freq: 1
    }, {
      value: 0,
      dref: 'sim/custom/lights/gears_red_left',
      freq: 1
    }, {
      value: 0,
      dref: 'sim/custom/lights/gears_red_right',
      freq: 1
    }, {
      value: 0,
      dref: 'sim/custom/lights/gears_green_front',
      freq: 1
    }, {
      value: 0,
      dref: 'sim/custom/lights/gears_green_left',
      freq: 1
    }, {
      value: 0,
      dref: 'sim/custom/lights/gears_green_right',
      freq: 1
    }, {
      value: 1,
      dref: 'sim/custom/controll/gear_lever',
      freq: 1
    }, {
      value: -1,
      process: (profile) => {
        if (profile.drNvar[0].value || profile.drNvar[1].value || profile.drNvar[2].value) {
          return 3;
        } else if (profile.drNvar[6].value === 1) {
          if (profile.drNvar[3].value * profile.drNvar[4].value * profile.drNvar[5].value) return 2;
          else return profile.drNvar[7].value;
        } else {
          return profile.drNvar[6].value + 1;
        }
      },
      execute: (profile, vjDevice, commClient, drNvar) => {
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
      device: 'gearPanel',
      counter: 10,
      n: 0
    }

  ],
  command: {
    1: (profile, udpClient) => {
      udpClient.executeCommand('sim/flight_controls/landing_gear_up');
      udpClient.executeCommand('sim/flight_controls/landing_gear_up');
    },
    2: (profile, udpClient) => {
      udpClient.executeCommand('sim/flight_controls/landing_gear_down');
      udpClient.executeCommand('sim/flight_controls/landing_gear_down');
    },
    0: (profile, udpClient) => {
      if (profile.drNvar[6].value === -1) {
        udpClient.executeCommand('sim/flight_controls/landing_gear_down');
      } else if (profile.drNvar[6].value === 1) {
        udpClient.executeCommand('sim/flight_controls/landing_gear_up');
      }
    }
  }
};
