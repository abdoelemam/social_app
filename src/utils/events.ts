import events from 'events';
import { deletefile, getFile } from './s3.config.js';
import { UserRepository } from '../DB/repositories/user.repository.js';
import userModel from '../model/user.model.js';
export var eventEmitter = new events.EventEmitter();

const _usermodel = new UserRepository(userModel);

eventEmitter.on("uploadprofileimage", async (data) => {
    const {userId, oldkey, newkey, expiresIn} = data;
    console.log("uploadprofileimage", data);

    setTimeout(async () => {
        try{
            await getFile({key: newkey });
            if(oldkey){
                await deletefile({key: oldkey });
            }
        }
        catch(error: any){
            // await deletefile({key: newkey });
            console.log("file not found", error);
            if(error?.Code == "NoSuchKey"){
                if(!oldkey){
                    await _usermodel.findOneAndUpdate({ _id: userId }, { $unset: { image: "" } });
                }
                else{
                    await _usermodel.findOneAndUpdate({ _id: userId }, { $set : { image: oldkey }, $unset: { tempimage: "" }  });
                }
            }
        }
    }, expiresIn * 1000);

});