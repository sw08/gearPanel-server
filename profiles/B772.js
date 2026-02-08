
module.exports = {
  drNvar: [{
    value: 0,
    dref: 'sim/flightmodel2/gear/deploy_ratio[0]',
    freq: 1
  }, {
    value: 0,
    dref: 'sim/flightmodel2/gear/deploy_ratio[1]',
    freq: 1
  }, {
    value: 0,
    dref: 'sim/flightmodel2/gear/deploy_ratio[3]',
    freq: 1
  },
  {
    value: -1,
    process: (profile) => {
      if (profile.drNvar[0].value === profile.drNvar[1].value && profile.drNvar[1].value === profile.drNvar[2].value) {
        if (profile.drNvar[0].value === 1) {
          return 1;
        } else {
          if (profile.drNvar[3].value === 3 || (profile.drNvar[3].value === -1 && !profile.drNvar[0].value)) {
            return 3;
          } else {
            return 0;
          }
        }
      } else {
        return 2;
      }
    },
    execute: (profile, vjDevice, commClient, drNvar) => {
      // console.log(commClient)
      switch (drNvar.value) {
        case 0:
          commClient.gearPanel.send('UP');
          profile.drNvar[3].delay = setTimeout(() => {
            commClient.gearPanel.send('');
            profile.drNvar[3].value = 3;
            profile.drNvar[3].delay = undefined;
          }, 10000);
          break;
        case 1:
          clearTimeout(profile.drNvar[3].delay);
          profile.drNvar[3].delay = undefined;
          commClient.gearPanel.send('DOWN&GREEN');
          break;
        case 2:
          clearTimeout(profile.drNvar[3].delay);
          profile.drNvar[3].delay = undefined;
          commClient.gearPanel.send('IN TRANSIT');
          break;
        case 3:
          clearTimeout(profile.drNvar[3].delay);
          profile.drNvar[3].delay = undefined;
          commClient.gearPanel.send('');
          break;
      }
    },
    device: 'gearPanel'
  }

  ],
  command: [
    null,
    'sim/flight_controls/landing_gear_up',
    'sim/flight_controls/landing_gear_down'
  ]
};
