/**
 * @typedef {Object} TelegramMessage
 * @property {number} message_id
 * @property {TelegramUser} from
 * @property {TelegramChat} chat
 * @property {number} date
 * @property {string} text
 * @property {TelegramEntity[]} entities
 */

/**
 * @typedef {Object} TelegramUser
 * @property {number} id
 * @property {boolean} is_bot
 * @property {string} first_name
 * @property {string} [language_code]
 */

/**
 * @typedef {Object} TelegramChat
 * @property {number} id
 * @property {string} first_name
 * @property {'private'|'group'|'supergroup'|'channel'} type
 */

/**
 * @typedef {Object} TelegramEntity
 * @property {number} offset
 * @property {number} length
 * @property {'mention'|'hashtag'|'bot_command'|'url'|'email'|'phone_number'} type
 */

/**
 * @typedef {Object} TelegramUpdate
 * @property {number} update_id
 * @property {TelegramMessage} message
 */
