import { Context } from '../../index';
import { addNews, retrieveNews } from '../database/data';
import { spoilerKeyboard } from '../telegram/keyboard';
import { parseSpoilerText } from '../utils/parse';
import { Spoiler, SpoilerContext } from './index';

const charactersLimit = 200;

const tagSpoiler = ({ translate }: Context): Spoiler => {
    return {
        title: translate.t('tagSpoilerTitle'),
        thumb_url: 'https://i.imgur.com/XkMEbd8.png',
        description: translate.t('tagSpoilerDescription'),
        message_text: translate.t('tagSpoilerMessageText')
    };
};

const counterSpoiler = ({ description, translate, name }: SpoilerContext): Spoiler => {
    const title = ('' === name) ? '' : translate.t('spoilerCounterName', { name: name });

    return {
        thumb_url: 'https://i.imgur.com/54qirkY.png',
        description: translate.t('counterDescription', { title }),
        message_text: translate.t('counterSpoilerMessageText'),
        title: translate.t('counterSpoilerTitle', { length: description.length, limit: charactersLimit })
    };
};

const lightSpoiler = ({ translate, id, title }: SpoilerContext): Spoiler  => {
    return {
        title: translate.t('lightSpoilerTitle'),
        thumb_url: 'https://i.imgur.com/XOzZR7c.png',
        reply_markup: spoilerKeyboard({ id, translate }),
        description: translate.t('lightSpoilerDescription'),
        message_text: translate.t('lightSpoilerMessageText', { title })
    };
};

const heavySpoiler = ({ translate, id, title }: SpoilerContext): Spoiler => {
    return {
        title: translate.t('heavySpoilerTitle'),
        thumb_url: 'https://i.imgur.com/TpAVSKT.png',
        description: translate.t('heavySpoilerDescription'),
        reply_markup: spoilerKeyboard({ id, translate, toHide: true }),
        message_text: translate.t('heavySpoilerMessageText', { title })
    };
};

const lewdSpoiler = ({ translate, id, title }: SpoilerContext): Spoiler => {
    return {
        title: translate.t('lewdSpoilerTitle'),
        thumb_url: 'https://i.imgur.com/64HsYmA.png',
        description: translate.t('lewdSpoilerDescription'),
        reply_markup: spoilerKeyboard({ id, translate, toHide: true }),
        message_text: translate.t('lewdSpoilerMessageText', { title })
    };
};

const newSpoiler = ({ name, description, title, translate, id }: Context): Array<Spoiler> => {
    if (description.length < charactersLimit) {
        return [
            tagSpoiler({ translate }),
            counterSpoiler({ description, name, translate }),
            lightSpoiler({ description, title, translate, id }),
            heavySpoiler({ description, title, translate, id }),
            lewdSpoiler({ description, title, translate, id })
        ];
    }

    return [
        {
            thumb_url: 'https://i.imgur.com/GPcjNb0.png',
            description: translate.t('sanitizeSpoilerDescription'),
            message_text: translate.t('sanitizeSpoilerMessageText'),
            title: translate.t('sanitizeSpoilerTitle', { length: description.length, limit: charactersLimit })
        }
    ];
};

const sanitizeSpoiler = async ({ message, translate, id }: Context): Promise<Array<Spoiler>> => {
    try {
        const { description, name } = await parseSpoilerText({ message });
        const spoilerId = <number> await addNews({ message: description, id });
        const title = ('' === name) ? '' : translate.t('spoilerName', { name: name });

        return newSpoiler({ name, title, description, translate, id: spoilerId });
    } catch (e) {
        console.error(e);

        return await [
            {
                title: translate.t('errorTitle'),
                thumb_url: 'https://i.imgur.com/hw9ekg8.png',
                description: translate.t('errorDescription'),
                message_text: translate.t('errorMessageText')
            }
        ];
    }
};

export const handleSpoiler = async ({ message, translate, id }: Context): Promise<Array<Spoiler>> => {
    if ('' !== message) {
        return await sanitizeSpoiler({ message, translate, id });
    }

    return await [
        {
            title: translate.t('handleSpoilerTitle'),
            thumb_url: 'https://i.imgur.com/ByINOFv.png',
            description: translate.t('handleSpoilerDescription'),
            message_text: translate.t('handleSpoilerMessageText')
        }
    ];
};

export const retrieveSpoiler = async ({ id, translate }: Context): Promise<string> => {
    try {
        return <string> await retrieveNews({ id });
    } catch (e) {
        console.error(e);

        return await translate.t('errorRetrieve');
    }
};
