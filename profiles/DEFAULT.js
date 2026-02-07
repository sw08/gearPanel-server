// works for B-29, c750, c-47, BAe 146, BE9L, EVOT, L410, AMF0(Metroliner), E55P, PC12, MD11, MD88, S76, VIPJ, A306, EA50, JS32, c404, F504(F50), SF34,

module.exports = {
  drNvar: [{
    value: 0,
    dref: 'sim/cockpit2/annunciators/gear_unsafe',
    freq: 1
  }, {
    value: 0,
    dref: 'sim/cockpit/switches/gear_handle_status',
    freq: 1
  },
  {
    value: 3,
    process: (profile) => {
      if (profile.drNvar[0].value) {
        return 2;
      } else {
        return profile.drNvar[1].value;
      }
    },
    execute: (profile, vjDevice, wsClient, drNvar) => {
      // console.log(drNvar.value)
      switch (drNvar.value) {
        case 0:
          wsClient.gearPanel.ws.send('');
          break;
        case 1:
          wsClient.gearPanel.ws.send('DN&LOCKED');
          break;
        case 2:
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
    null,
    'sim/flight_controls/landing_gear_up',
    'sim/flight_controls/landing_gear_down'
  ]
};
