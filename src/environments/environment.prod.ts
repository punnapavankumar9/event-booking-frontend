import {createEnvironment} from './environment.common';

// nginx proxy will send it to backend gateway service.
export const gatewayUrl = ""

export const environment = createEnvironment(gatewayUrl);
