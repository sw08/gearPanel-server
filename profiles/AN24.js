
module.exports = {
  drNvar: [{
    value: 0,
    dref: 'sim/cockpit2/annunciators/gear_unsafe',
    freq: 1
  }, {
    value: 1,
    dref: 'sim/custom/xap/An24_hydro/gear_rotary',
    process: (profile, value) => value + 1,
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
    execute: (profile, vjDevice, wsClient, drNvar) => {
      // console.log(drNvar.value)
      switch (drNvar.value) {
        case 0:
          wsClient.gearPanel.ws.send('UP&LOCKED');
          break;
        case 1:
          wsClient.gearPanel.ws.send('');
          break;
        case 2:
          wsClient.gearPanel.ws.send('DN&LOCKED');
          break;
        case 3:
          wsClient.gearPanel.ws.send('IN TRANSIT');
          break;
      }
    },
    device: 'gearPanel',
    counter: 10,
    n: 0
  }

  ],
  command: [
    [
      ['sim/flight_controls/landing_gear_up', profile => profile.drNvar[1].value === 2],
      ['sim/flight_controls/landing_gear_down', profile => profile.drNvar[1].value === 0]
    ],
    ['sim/flight_controls/landing_gear_up', 'sim/flight_controls/landing_gear_up'],
    ['sim/flight_controls/landing_gear_down', 'sim/flight_controls/landing_gear_down']
  ]
};
