import { flags, SfdxCommand } from '@salesforce/command';
import util = require('util');
import child_process = require('child_process');
export default class UserGet extends SfdxCommand {
    
  public static description = 'compares users between 2 orgs';

  public static examples = [
    
  ];

  protected static flagsConfig = {
    source: flags.string({
      char: 's',
      description: 'source org',
      required: true
    }),
    target: flags.string({
      char: 't',
      description: 'target org',
      required: false
    })
   
  };

  protected static requiresUsername = false;

  public async run(): Promise<AnyJson> {
    

    let query = `SELECT Id, IsActive, Name FROM User`;

    const baseCommand_source = `sfdx force:data:soql:query --json --query "${query}" --targetusername "${this.flags.source}"`;
    const exec = util.promisify(child_process.exec);
    const process = await exec(baseCommand_source);
    var usersFromSource = JSON.parse(process.stdout);
    //console.log('records', usersFromSource.result.records);

    const baseCommand_target = `sfdx force:data:soql:query --json --query "${query}" --targetusername "${this.flags.target}"`;
    const exec2 = util.promisify(child_process.exec);
    const process2 = await exec(baseCommand_target);
    var usersFromTarget = JSON.parse(process2.stdout);
    //console.log('records', usersFromTarget.result.records);
    
    var results = [];
    var userResults = [];

    usersFromSource.result.records.forEach(userFromSource => {
        var found = false;
        usersFromTarget.result.records.forEach(userFromTarget => {
            if (userFromSource.Name === userFromTarget.Name) {
                found = true;
            }            
        });
        if (found === false) {
            results.push(userFromSource.Name);
            userResults.push({Id: userFromSource.Id, Name: userFromSource.Name, IsActive: userFromSource.IsActive});
        }      
    });
    userResults.forEach(result => {
        //this.ux.log(result);
        
        this.ux.log(`Id: "${result.Id}" | IsActive: "${result.IsActive}" | Name: "${result.Name}" `);
        
    });
   
    //console.log('results' , results);

  }
}
