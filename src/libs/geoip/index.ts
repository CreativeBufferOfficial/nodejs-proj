import geoip from 'geoip-lite';

export const IPLookup = ({ ip }: { ip: string }) => {
    const geo: any = geoip.lookup(ip);
    return geo;
}