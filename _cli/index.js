/**
 * @typedef {Object} TransformOptions
 * @property {Record<string, *>} customTransformOptions - Кастомные опции трансформации
 * @property {boolean} dev - Флаг режима разработки
 * @property {boolean} minify - Флаг минификации кода
 * @property {string} platform - Целевая платформа (например, "ios", "android")
 * @property {string} type - Тип модуля
 * @property {string} unstable_transformProfile - Профиль трансформации
 */

/**
 * @typedef {Object} PackageInfo
 * @property {string} name - Название пакета
 * @property {string} absolutePath - Абсолютный путь к пакету
 * @property {string} version - Версия пакета
 * @property {string} path - Относительный путь к пакету
 */

/**
 * @typedef {Object} SourceInfo
 * @property {string} code - Исходный код
 * @property {number} lineCount - Количество строк в исходном коде
 * @property {number} sizeInBytes - Размер исходного кода в байтах
 */

/**
 * @typedef {Object} OutputInfo
 * @property {string} code - Скомпилированный/сминифицированный код
 * @property {number} lineCount - Количество строк в итоговом коде
 * @property {number} sizeInBytes - Размер итогового кода в байтах
 */

/**
 * @typedef {Object} ModuleInfo
 * @property {string} path - Относительный путь к модулю
 * @property {SourceInfo} source - Информация об исходном коде
 * @property {OutputInfo} output - Информация о собранном коде
 * @property {Array<*>} dependencies - Список зависимостей модуля
 * @property {string} absolutePath - Абсолютный путь к файлу модуля
 * @property {Array<*>} duplicates - Дубликаты модуля
 * @property {ModuleInfo[]} dependents - Модули, зависящие от данного (рекурсивный тип)
 */

/**
 * @typedef {Object} BuildReport
 * @property {number} date - Timestamp даты сборки
 * @property {string} entryPoint - Абсолютный путь к точке входа
 * @property {TransformOptions} transformOptions - Параметры трансформации
 * @property {Record<string, string>} envs - Переменные окружения
 * @property {string} rootFolder - Абсолютный путь к корневой папке проекта
 * @property {PackageInfo[]} packages - Список используемых пакетов
 * @property {ModuleInfo[]} modules - Список обработанных модулей
 */

/** @type {BuildReport} */
const report = require("./tmp/metro-stats.json");
