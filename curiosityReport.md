# Curiosity Report: Restic Backups

## What Is Restic?
**Restic** is a backup program that allows for backing up files. It is modern, efficient, secure, and is designed to work across a multitude of operating systems such as Windows, macOS, Linux, and FreeBSD. Restic also uses an incremental backup model, meaning only the updated parts of files are backed up after the initial backup (the files that had changes made to them).

### How it works:
1. All data created during a Restic backup job is stored in what is called a Repository. This can be viewed as a directory (e.g. `/backups/restic-data/...<restic_data_here>`)
2. Files are split into chunks of data, referred to as **data blobs**.
3. Directory structure is referred to as **tree blobs**.
4. Within a repository, there are snapshots which hold the data that is backed up. These snapshots point to tree blobs.
5. Blobs are identified using a SHA-256 hash.

## Why I was Curious About Restic
The reason Restic intrigued me was because I use Restic for my personal homelab backups. I self-host a (fairly) large amount of applications and services, some of which hold sensitive data. 

Currently, I use a web wrapper built on top of Restic called [Backrest](https://github.com/garethgeorge/backrest) on each of my servers/nodes.

### My Backup Workflow
`[Directory to Backup] ON <NODE> --> Restic (Configured via Backrest WebUI) --> Restic backend (rest:http://<node>:<PASS>@192.168.x.x:8000/<node_name>/) --> [Repository Directory on Backup Share] ON <BACKUP_SERVER> --> Sends Successful Backup Notification to Telegram` </br>
**Across 4 out of 5 nodes, 37 snapshots kept at all times*

It is incredibly important that I have backups at the ready if anything were to go wrong such as corruption, a bad update, accidental deletions, and misconfigurations. I wanted to understand Restic a bit more in-depth since it is such a vital part of my infrastructure.

## Characterisics of Restic
There are a lot of options when it comes to choosing a service for backups. They each have their own set of characteristics. Some of Restic's include:

1. **Availability**: Works across the vast majority of operating systems.
2. **Efficiency**: Only backs up blocks of files that have had changes done to them.
3. **Security**: Uses cryptography to encrypt the data.
4. **Verifiability**: Verifies the integrity of the backups to make sure files can be restored when needed.
5. **Free**: Open source & free to use!

Restic also allows for native cloud integration with Amazon S3, Wasabi, Alibaba Cloud, Google Cloud Storage, Microsoft Azure Blob Storage, and more. [Borg](https://github.com/mikesmullin/borg) is another strong contender when it comes to backups, however, the only cloud service it has integration for is AWS. This makes Restic the more flexible option for those already using other cloud services.

## How This Relates To The Course
Backups are an *incredibly* vital component to DevOps. If something I mentioned above were to happen (corruption, data loss, misconfiguration) and no backups are available, it can cause downtime and lead to unhappy customers and money lost. Which we all know is very bad and we want to minimize the risk of that happening at all costs. Having readily available backups allows for redundancy in case anything goes wrong and needs to be reverted and restored on the fly.

## Experiment: How does Restic store backup data?
To observe and understand restic more in depth, I thought I would go through and setup restic from the very beginning (this time without a web wrapper).

***Important Note:*** The reason I am not testing and analyzing this on my server setup is to minimize the risk of accidentally deleting/corrupting/misconfiguring something of value, hence the reason for setting this up on my laptop, which is much more forgiving to correct in case of a fatal mistake.

## Initializing The Backup
After I made sure Restic was installed, I initialized my Restic repository and mapped it to a directory with the following command: `restic init --repo /home/user/Documents/restic-backups-329`

The first thing I noticed when I set the source of my Restic repository was that even though the repository is currently empty, there was still a file structure in place even before backing up anything. Initializing the repository must prepare it for future backup jobs.

```bash
.../restic-backups-329$ ls
config  data  index  keys  locks  snapshots
```
The `snapshots` directory was also empty, which makes sense given we have not yet run a backup. If we had, we should see *something* in there presumably. 

```bash
.../restic-backups-329$ cd snapshots/
.../restic-backups-329/snapshots$ ls
```
With that in mind, I went ahead and ran my first backup.

```bash
...restic-backups-329/snapshots$ restic -r /home/user/Documents/restic-backups-329 --verbose backup /home/user/Documents/really-important-definitely
open repository
repository 4037ce64 opened (version 2, compression level auto)
created new cache in /home/user/.cache/restic
no parent snapshot found, will read all files
load index files
[0:00]          0 index files loaded
start scan on [/home/user/Documents/really-important-definitely]
start backup on [/home/user/Documents/really-important-definitely]
scan finished in 0.002s: 1 files, 5 B

Files:           1 new,     0 changed,     0 unmodified
Dirs:            4 new,     0 changed,     0 unmodified
Data Blobs:      1 new
Tree Blobs:      5 new
Added to the repository: 2.397 KiB (1.974 KiB stored)

processed 1 files, 5 B in 0:04
snapshot 0892f211 saved
```
## Analysis of The Backup
Listing the elements in the `snapshots` directory proved that there was indeed something there, presumably my latest backup. And upon further inspection, it indeed was a snapshot of my latest backup.
```bash
.../restic-backups-329/snapshots$ ls
0892f211a8b0132e7845e4e486bf710eef108ad4e951cd69c540e68ae4f46cac
```
```bash
.../restic-backups-329/snapshots$ restic -r /home/user/Documents/restic-backups-329 snapshots
repository 4037ce64 opened (version 2, compression level auto)
ID        Time                 Host                  Tags        Paths                                               Size
-------------------------------------------------------------------------------------------------------------------------
0892f211  2026-09-10 00:12:51  laptop              /home/user/Documents/really-important-definitely  5 B
-------------------------------------------------------------------------------------------------------------------------
Timestamps shown in local time
1 snapshots
```
**Things I noticed:**
- 3 different numbers: `2.397 KiB` vs `1.974 KiB stored` vs `5 B`
- Snapshot name does not seem to reflect repository name, where is that coming from?
- Snapshot 1's size is 5 bytes, which aligns with the data that was backed up, a text file inside of the backed up directory.
- Data Blobs and Tree Blobs, what do those values mean?

## Adding files

Backing up a text file is fine, but to make it meaningful I needed to add a larger file to the snapshot.

```bash
cp -r Daily\ Videos/ really-important-definitely/ # Daily Videos is ~2.5G in size
```
```
.../restic-backups-329/snapshots$ restic -r /home/user/Documents/restic-backups-329 --verbose backup /home/user/Documents/really-important-definitely
open repository
repository 4037ce64 opened (version 2, compression level auto)
using parent snapshot 0892f211
load index files
[0:00] 100.00%  1 / 1 index files loaded
start scan on [/home/user/Documents/really-important-definitely]
start backup on [/home/user/Documents/really-important-definitely]
scan finished in 0.003s: 144 files, 2.447 GiB

Files:         143 new,     0 changed,     1 unmodified
Dirs:            8 new,     4 changed,     0 unmodified
Data Blobs:   1728 new
Tree Blobs:     13 new
Added to the repository: 2.444 GiB (2.432 GiB stored)

processed 144 files, 2.447 GiB in 0:05
snapshot 22979cf9 saved
```
 We can see that there has been significantly more data added, `2.444 GiB` to be exact and 143 out of the 144 are new files, the one old file would be the original text document. This confirms that Restic can see and add new files to a snapshot.

## What do the different repo backup numbers mean?
For this snapshot, the file sizes are `2.444 GiB` vs `2.432 GiB stored` vs `2.447 GiB`. </br> </br>
In the [backup](https://restic.readthedocs.io/en/stable/040_backup.html) section of the Restic documentation, I found out that the processed number is the size of all the files and directories in `really-important-definitely`. The `2.444 GiB` that was added is actually self explanatory, that is the data that was added to the repo. And finally, the `2.432 GiB stored` value is reporting that the compression managed to compress the data down to that size from the original `2.444 GiB`.

## What are `Data Blobs` and `Tree Blobs`? (Diving into the Restic structure)
Once again from the Restic docs, I found out the following:
- **Data Blobs** are the *actual* chunks of the file. The reason it stores the files as these chunks or "blobs" is because when you modify a file, Restic doesn't need to rewrite the entire file over. It just needs to write new blobs pointing to that changed data. 
- **Tree Blobs** are the actual directory structure itself.

We can see a bit more info when we print the snapshot data out like so:
```bash
...restic-backups-329/snapshots$ restic -r /home/user/Documents/restic-backups-329 cat snapshot 22979cf9
repository 4037ce64 opened (version 2, compression level auto)
{
  "time": "2026-09-10T01:01:39.924013029-06:00",
  "parent": "0892f211a8b0132e7845e4e486bf710eef108ad4e951cd69c540e68ae4f46cac", # Name of the snapshot file here!
  "tree": "0914043b2270ef2d8ccdccce9c74610cb5067de2e6efacaba17041e53319cc83", # Tree blob here!
  "paths": ...
}
```
What happens if we expand that tree blob hash all the way down? What do we get?
```bash
# Daily Videos & the text file that were backed up

.../restic-backups-329/snapshots$ restic -r /home/user/Documents/restic-backups-329 cat blob 9f01e8f2d7efcc948107326effe68fd054721df7349c78feb21f85e67bba0659
repository 4037ce64 opened (version 2, compression level auto)
[0:00] 100.00%  2 / 2 index files loaded
{"nodes":[{"name":"Daily Videos","type":"dir",..."value":"dW5jb25maW5lZF91Om9iamVjdF9yOnVzZXJfaG9tZV90OnMwAA=="}],"content":null,"subtree":"18d0055b0a0f59f0733211fbe89ed8f715fafd07ef0caf0dab34b83ea218bf54"}{"name":"something-important.txt","type":"file",..."value":"dW5jb25maW5lZF91Om9iamVjdF9yOnVzZXJfaG9tZV90OnMwAA=="}],"content":["6fd8b59758124d67276be4b790546b688fc76cd8bd1a13fc81ecee4e304710af"]}]}

```
And if we expand these just one more time we get:

```bash
# Directory and files inside of Daily Videos!

.../restic-backups-329/snapshots$ restic -r /home/user/Documents/restic-backups-329 cat blob 18d0055b0a0f59f0733211fbe89ed8f715fafd07ef0caf0dab34b83ea218bf54
repository 4037ce64 opened (version 2, compression level auto)
[0:00] 100.00%  2 / 2 index files loaded
{"nodes":[{"name":"Corny on the Bob","type":"dir","mode":2147484141,"mtime":"2026-09-10T01:00:33.608007221-06:00","atime":"2026-09-10T01:00:33.608007221-06:00","ctime":"2026-09-10T01:00:33.608007221-06:00" ...
```
```bash
# The contents of the text file!

...restic-backups-329/snapshots$ restic -r /home/user/Documents/restic-backups-329 cat blob 6fd8b59758124d67276be4b790546b688fc76cd8bd1a13fc81ecee4e304710af
repository 4037ce64 opened (version 2, compression level auto)
[0:00] 100.00%  2 / 2 index files loaded
bleh
```
Since we know that Restic uses SHA-256 hash for these blobs, let's confirm that instead of assuming.
```bash
.../restic-backups-329/snapshots$ restic -r /home/user/Documents/restic-backups-329 cat blob 6fd8b59758124d67276be4b790546b688fc76cd8bd1a13fc81ecee4e304710af | sha256sum

Output:
6fd8b59758124d67276be4b790546b688fc76cd8bd1a13fc81ecee4e304710af 

# Matches!
```
This shows that Restic works as one giant graph, we keep going all the way down from each blob, and we get the original files. </br>
We can also see that these SHA-256 blob hashes are how the blobs are identified.

## Challenges
This experiment overall did not pose too much of a challenge for me as Restic is fairly self explanatory as a whole, and the outputs that it gives you are mostly clear of confusing information. However, there were definitely some challenges that I came across. For one, assessing the three different file sizes from the repository output command proved to be difficult to parse. I was initially confused, because my folder and file sizes should stay the same throughout the backup, not change. This initially made me worried that I had set up Restic incorrectly, though later proved to be a lot simpler than that and made perfect sense.

Understanding the Restic backup structure also proved to be quite challenging in the sense of understanding how snapshots, data blobs, and tree blobs all work together. There is definitely a lot more going on under the hood than meets the eye. I at first did not understand I was looking at an SHA-256 hash either, I assumed it was originally something specific to Restic itself to identify the blobs. However, upon further investigation my original assumption was corrected.

I should also note the limitations with this experiment. Looking through the Restic documentation even for a short period proves there is a lot more that could be tested and experimented with than what I have outlined here. Further testing may introduce new problems and potentially poke holes in some of Restic's implementation of backups.

## My Opinions On Restic
I have a favoritism bias toward Restic because as I stated beforehand, I have been using Restic to handle my personal backups. I have found it to be an extremely useful technology to learn and use. I also have yet to run into a major problem with Restic in my own use. However, this does not mean Restic is perfect.

Some of its imperfections are apparent in this report:
- **There is no native UI** - 3rd party UI exists ([Backrest](https://github.com/garethgeorge/backrest)). However, everything on the Restic side is done from the command line, which for beginners can introduce mistakes. 
- **Passwords are ESSENTIAL** - If you lose the password to your repository, the data is gone. It is not recoverable. 
- **Complexity** - An everyday user that has no terminal experience and limited technology wanting to setup backups will have a rough time getting Restic to backup what they want. This also ties in with having no native UI.

## Conclusion
Diving into Restic proved to expand to a lot more territory than I originally assumed. There is a lot that goes on under the "modern backup program" that Restic is. When tracing a snapshot down to it's very base level, I did not expect to see the actual file that was backed up (including the contents) and the directory structure of the directory that was backed up. I was not entirely sure what to expect once it was traced down to the bottom, but not the exact files themselves. Backups are split up into data blobs, and directory structure is formatted as tree blobs. These data blobs are what allow for data to be manipulated and changed without rewriting the entire file to the backup again. </br> </br>
In the future I would like to dive into how Restic decrypts and restores a backup in case of failure. What allows Restic to do that under the hood? And how does it rebuild your files from the data blobs that it stores? 

## References
- [Restic](https://restic.net/)
- [Restic Design Docs](https://restic.readthedocs.io/en/stable/100_references.html#design)
- [Restic Documentation Overview](https://restic.readthedocs.io/en/stable/index.html)
- [Restic Backup Documentation](https://github.com/garethgeorge/backrest)
- [Borg Cloud Integration](https://mikesmullin.github.io/borg-docs/index.html#cloud-integration)
