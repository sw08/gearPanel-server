
module.exports = {
  drNvar: [
    {
      value: 0,
      dref: 'B742/front_lamps/LG_gear_lit',
      freq: 1
    },
    {
      value: 0,
      dref: 'B742/front_lamps/LG_door_open_lit',
      freq: 1
    },
    {
      value: 1,
      dref: 'B742/controls/gear_lever_pos',
      process: (profile, value) => value + 1, // 2 dn 1 off 0 up
      freq: 1
    },
    {
      value: -1,
      process: (profile) => {
        if (profile.drNvar[0].value || profile.drNvar[1].value) {
          if (profile.drNvar[2].value === 1) {
            return 4;
          } else {
            return 3;
          }
        } else {
          return profile.drNvar[2].value;
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
          case 4:
            commClient.gearPanel.send('GEAR');
            break;
        }
      },
      device: 'gearPanel',
      counter: 10,
      n: 0
    }
  ],
  command: [
    'sim/flight_controls/landing_gear_off',
    'sim/flight_controls/landing_gear_up',
    'sim/flight_controls/landing_gear_down'
  ]
};
