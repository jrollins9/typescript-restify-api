var gulp = require("gulp"),
    sourcemaps = require("gulp-sourcemaps"),
    mkdirp = require("mkdirp"),
    nodemon = require("gulp-nodemon"),
    ts = require("gulp-typescript"),
    tsProject = ts.createProject("tsconfig.json"),
    del = require("del"),
    sequence = require("run-sequence"),
    mongoose = require("mongoose"),
    outputDir = "./build",
    seed = {
        db: {
            name: "mongodb://localhost:27017/dev",
            options: {
                server: {
                    socketOptions: {
                        keepAlive: 0
                    }
                }
            }
        },
        count: 50 // number of documents to seed
    };

/* Tasks */
gulp.task("clean", function () {
    return del([outputDir + "/**/*"]);
});

gulp.task("mkdir-logs", function () {
    return mkdirp(outputDir + "/logs", function(err) {
        if (err) {
            console.log(err);
        }
    });
});

gulp.task("compile", function () {
    return tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject()).js
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(outputDir));
});

gulp.task("build", function (cb) {
    sequence("clean", "mkdir-logs", "compile", cb);
});

gulp.task("seed", function () {

    var db = mongoose.connect(seed.db.name, seed.db.options).connection;

    mongoose.set('debug', true);

    db.on('error', function (err) {
        throw new Error("Unable to connect to database: " + err);
    });

    db.once('open', function () {
        console.log("Connected to database");

        var collection = db.collection("widgets");

        // delete all documents
        collection.remove({})
            .then(function () {
                var seeds = [],
                    timestamp = new Date();

                for (var x = 0; x < seed.count; x++) {
                    timestamp = new Date(timestamp.getTime() + 1000);

                    seeds.push({
                        "__v": 0,
                        "current": Math.random() < 0.5, // random boolean
                        "name": "Widget" + x,
                        "description": "description for widget" + x,
                        "rank": Math.floor(Math.random() * 5) + 1, // random number between 1-5
                        "createdAt": timestamp,
                        "updatedAt": timestamp,
                        "deleted": false,
                        "deletedAt": null
                    });
                }

                return collection.insertMany(seeds);
            })
            .then(function () {
                return collection.count({})
                    .then(function (cnt) {
                        console.log(cnt + " documents seeded");
                        db.close();
                    });
            })
            .catch(function (err) {
                console.log(err);
                db.close();
            });
    });

    db.once('close', function () {
        console.log("Connection closed");
    });
});

gulp.task("start", function () {
    nodemon({
        script: outputDir + "/server.js",
        tasks: ["compile"],
        ext: "ts",
        env: {
            "NODE_ENV": "development"
        }
    });
});