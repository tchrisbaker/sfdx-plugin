import { flags, SfdxCommand } from '@salesforce/command';
import util = require('util');
import child_process = require('child_process');
export default class UserGet extends SfdxCommand {
    
  public static description = 'gets users based on certain parameters';

  public static examples = [
    'sfdx df19:user:get',
    'sfdx df19:user:get --active --name "john smith"',
    'sfdx df19:user:get --active --profile admin',
    'sfdx df19:user:get --active --userrole sales',
    'sfdx df19:user:get --active --skinny',
    'sfdx df19:user:get --active --outputcsv',
  ];

  protected static flagsConfig = {
    active: flags.boolean({
      char: 'a',
      description: 'only return active users',
    }),
    name: flags.string({
      char: 'n',
      description: 'return users whose name contains this value',
    }),
    profile: flags.string({
      char: 'p',
      description: 'return users whose profile name contains this value',
    }),
    userrole: flags.string({
      char: 'r',
      description: 'return users whose user role developer name contains this value',
    }),
    skinny: flags.boolean({
      char: 's',
      description: 'only returns the Username and Id of each result',
    }),
   
  };

  protected static requiresUsername = true;

  public async run(): Promise<AnyJson> {
    /*interface Account {
        Id: string;
        Name: string;
    }*/
    // 1) build query
    const username = this.org.getUsername();

    const fields = {
      default: [
        'FirstName',
        'LastName',
        'Name',
        'Email',
        'Username',
        'Id',
        'IsActive',
        'format(LastLoginDate)',
      ],
      skinny: [
        'Name',
        'Username',
        'Id',
      ],
    };

    let query = `SELECT ${
      this.flags.skinny === true ? 
        fields.skinny.toString() : fields.default.toString()} FROM User `;

    let hasFilter: boolean = false;
    const filterKeyword = (): string => {
      if (hasFilter) {
        return 'AND';
      }

      hasFilter = true;
      return 'WHERE';
    };

    query += (this.flags.active || this.flags.active) ?
      filterKeyword() + ` IsActive = ${this.flags.active} ` : '';

    query += (this.flags.name) ?
      filterKeyword() + ` Name LIKE '%${this.flags.name}%' ` : '';

    query += (this.flags.profile) ?
      filterKeyword() + ` Profile.Name LIKE '%${this.flags.profile}%' ` : '';

    query += (this.flags.userrole) ?
      filterKeyword() + ` UserRoleId != NULL AND UserRole.DeveloperName LIKE '%${this.flags.userrole}%' ` : '';

    query += 'ORDER BY IsActive DESC, Name ASC';
    const baseCommand = `sfdx force:data:soql:query --query "${query}" --targetusername ${username}`;

    const exec = util.promisify(child_process.exec);
    const process = await exec(baseCommand);
    console.log(process.stdout);
    

  }
}
