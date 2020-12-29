const isFunction = (identifier) => typeof identifier === 'function';

const mround = (value, precision) => Math.round(value / precision) * precision;

const mired2kelvin = (mired) => (1 / mired) * Math.pow(10, 6);
const kelvin2mired = (kelvin) => Math.pow(10, 6) / kelvin;

const getKelvin = (mired) => mround(mired2kelvin(mired), 50);
const getMired = (kelvin) => Math.round(kelvin2mired(kelvin));

module.exports = {
    isFunction,
    mround,
    mired2kelvin,
    kelvin2mired,
    getKelvin,
    getMired,
}
