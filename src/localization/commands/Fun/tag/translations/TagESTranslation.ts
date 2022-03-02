import { Translation } from "@alice-localization/base/Translation";
import { TagStrings } from "../TagLocalization";

/**
 * The Spanish translation for the `tag` command.
 */
export class TagESTranslation extends Translation<TagStrings> {
    override readonly translations: TagStrings = {
        nameTooLong: "Hey, ese nombre para el tag es muy largo!",
        contentTooLong: "Hey, el contenido para el tag es muy largo!",
        tagExists: "Lo siento, ya existe un tag con ese nombre!",
        tagDoesntExist: "Lo siento, no existe ningún tag con ese nombre!",
        tagDoesntHaveContentAndAttachments:
            "Lo siento, este tag no tiene ningún contenido ni adjunto!",
        tagDoesntHaveAttachments: "Lo siento, este tag no tiene nada adjunto!",
        tagAttachmentURLInvalid: "Hey, por favor ingresa una URL válida!",
        noTagAttachmentSlot:
            "Lo siento, solo puedes adjuntar 3 archivos como máximo!",
        tagAttachmentTooBig:
            "Lo siento, el tamaño del archivo es demasiado grande! Solo puedes adjuntar una imagen con un tamaño máximo de 8MB!",
        addTagSuccessful: "Tag %s agregado correctamente.",
        editTagSuccessful: "Tag %s editado correctamente.",
        attachToTagSuccessful: "Imagen añadida al tag %s correctamente.",
        deleteTagIndexOutOfBounds:
            "Lo siento, el tag solo tiene %s adjunto(s)!",
        deleteTagSuccessful: "Tag %s eliminado correctamente.",
        deleteTagAttachmentSuccessful:
            "Adjunto del tag %s eliminado correctamente.",
        transferTagSuccessful:
            "Los tags de %s fueron transferidos a %s correctamente.",
        notTagOwner: "Lo siento, este tag no te pertenece!",
        selfDoesntHaveTags:
            "Lo siento, no tienes ningun tag guardado en este servidor!",
        userDoesntHaveTags:
            "Lo siento, este usuario no tiene ningun tag guardado en este servidor!",
        tagInfo: "",
        tagName: "",
        tagAuthor: "",
        tagCreationDate: "",
        tagAttachmentAmount: "",
        tagsForUser: "",
        totalTags: "",
    };
}
