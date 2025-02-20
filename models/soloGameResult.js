const mongoose = require("mongoose");
const Joi = require("joi");


//nicht entschieden ob ganze Spiele gespeichert werden sollen, wahrscheinlich eher nicht
//schlechte Bennung noch Frage zu Question umwandeln und Attribute die ID speichern auch so benennen und auch in allen anderen Files die mit diesen Objekten arbeiten Front und Backend
const answer = new mongoose.Schema({
    
    frage: {type: String , 
            validate:{
                validator: function (v){
                    return mongoose.isValidObjectId(v);
                }
            },
            requried: true
    },
    isTrue: {type: Boolean, required: true} 
})

const soloResultSchema = new mongoose.Schema({
    judgedAnswers: {type: [answer], required: true}
})


function validateSoloResult(soloResult){
    const schema = Joi.object({
        judgedAnswers: Joi.array().items(Joi.object({
                frage: Joi.custom((value, helper)=>{
                if(!mongoose.isValidObjectId(value))
                {return helper.message("not a valid objectID");}
                else {return true;}
            }).required(),
            isTrue: Joi.bool().required()
        }))
    })
    return schema.validate(soloResult);
}

exports.SoloResult = mongoose.model("SoloResult", soloResultSchema);
exports.validateSoloResult = validateSoloResult;