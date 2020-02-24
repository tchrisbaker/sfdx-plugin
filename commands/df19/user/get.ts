import { flags, SfdxCommand } from '@salesforce/command';

//import {Account} from '../../../shared/typeDefs';



export default class AccountGet extends SfdxCommand {
    
  public static description = 'Get accounts by name'

  public static examples = [
    'sfdx df19:account:get --name "Fake Account'
  ];

  protected static flagsConfig = {
    // flag with a value (-n, --name=VALUE)
    name: flags.string({
        char: 'n', 
        description: 'the name of the account to find',
        required: true
    })
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;


  public async run(): Promise<AnyJson> {
    interface Account {
        Id: string;
        Name: string;
    }
    // 1) build query
    const query: string = `Select Id, Name from Account WHERE Name = '${this.flags.name}'`;
    // 2) run query
    // this.org is guaranteed because requiresUsername=true, as opposed to supportsUsername
    const conn = this.org.getConnection();
    const result = await conn.query<Account>(query);
    // 3) log results
    //const name = this.flags.name || 'world';

    // Organization will always return one result, but this is an example of throwing an error
    // The output and --json will automatically be handled for you.
    if (!result.records || result.records.length <= 0) {
      throw new Error(`no accounts found with the name: ${this.flags.name}`);
    }

    const accounts : Account[] = result.records;
    accounts.forEach((account: Account) => {
        this.ux.log(`Id: ${account.Id} | Name: $(account.Name}`);
    })

    // Return an object to be displayed with --json
    return { orgId: this.org.getOrgId(), accounts }

  }
}
