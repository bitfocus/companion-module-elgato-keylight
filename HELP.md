## Elgato-Keylight

This module will allow you to control the elgato Keylight and Ringlight family of products using Companion. 

### Configuration
* The keylight must be powered on and connected to the same network as the computer that is running Companion. The keylight can be controlled accross VLANs, however, you must allow communication between the required VLANs on port 9123.
* This module controls the keylight through REST on port 9123.

#### Static Network Configuration
* In order to use the KeyLight, you will need the KeyLight to have a static IP address. One way to accomplish this is:
  * Have the KeyLight given a static IP by doing a DHCP reservation on your home router or DHCP server.
 

### To use the module
Add a button and choose the action you want to use.

**Avalible Actions:**
* Turn the keylight on and off.
* Adjust the brightness of the keylight.
* Adjust the color temerature of the keylight.

### Tested Devices
* KeyLight (Firmware: 1.0.3/200)
* KeyLight Air (Firmware: 1.0.3/195, 1.0.3/200)
