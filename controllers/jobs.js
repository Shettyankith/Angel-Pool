const Job = require("../models/job");

module.exports.index=async (req, res) => {
    let jobs = await Job.find();
    res.render("jobs/index.ejs", { jobs });
}

module.exports.show=async (req, res) => {
    try {
      const id = req.params.id;
      const job = await Job.findById(id).populate("postedby");
      if (!job) {
        return res.status(404).send("Job not found");
      }
      let postedby = job.postedby;
      let role = req.user;
      res.render("jobs/show.ejs", { job, role, postedby, currentUser: req.user });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  module.exports.editForm=async (req, res) => {
    let id = req.params.id;
    let job = await Job.findById(id);
    res.render("jobs/edit.ejs", { job });
  }

  module.exports.edit=async (req, res) => {
    let id = req.params.id;
    let newJob = { ...req.body, new: true };
    await Job.findByIdAndUpdate(id, newJob);
    req.flash("success", `${newJob.title} details edited successfully`);
    res.redirect(`/jobs/show/${id}`);
  }

  module.exports.deleteJob=async (req, res) => {
    let id = req.params.id;
    await Job.findByIdAndDelete(id);
    req.flash("success", "Job details deleted!");
    res.redirect("/jobs");
  }

  module.exports.createForm=(req, res) => {
    res.render("jobs/new.ejs");
  }

  module.exports.create=async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;
    let newJobData = req.body;
    newJobData.logo = { url, filename };
    newJobData.postedby = req.user._id;
    let newJob = new Job(newJobData);
    await newJob.save();
    console.log(newJob);
    req.flash("success", `${newJob.title} role created`);
    res.redirect("/jobs");
  }

  module.exports.savedJobs=async (req, res) => {
    let id = req.params.id;
    const savedJob = req.user.savedJobs.includes(id);
    if (savedJob) {
      req.flash("warning", "This job is already saved!");
      res.redirect(`/jobs/show/${id}`);
    } else {
      const job = await Job.findById(id);
      if (!job) {
        req.flash("failure", "Job not found!");
        res.redirect(`/jobs/show/${id}`);
      }
      req.user.savedJobs.push(id);
      await req.user.save();
      req.flash("success", "Job is saved successfully");
      res.redirect(`/jobs/show/${id}`);
    }
  }

  module.exports.deleteSavedJob=async (req, res) => {
    let jobId = req.params.id;
    const jobIndex = req.user.savedJobs.indexOf(jobId);
    req.user.savedJobs.splice(jobIndex, 1);
    await req.user.save();
    req.flash("success", "Job is removed from saved list");
    res.redirect("/user/my-account");
  }

  module.exports.apply=async (req, res) => {
    const id = req.params.id;
    const appliedJob = req.user.appliedJobs.includes(id);
    if (appliedJob) {
      req.flash("warning", "You have already applied for this role!");
      res.redirect(`/jobs/show/${id}`);
    } else {
      let job = await Job.findById(id);
      if (!job) {
        req.flash("failure", "Job not found!");
        res.redirect(`/jobs/show/${id}`);
      }
      req.user.appliedJobs.push(id);
      await req.user.save();
      req.flash("success", "You profile has been sent to HR");
      res.redirect(`/jobs/show/${id}`);
    }
  }

  module.exports.deleteAppliedJob=async (req, res) => {
    let jobId = req.params.id;
    const jobIndex = req.user.appliedJobs.indexOf(jobId);
    req.user.appliedJobs.splice(jobIndex, 1);
    await req.user.save();
    req.flash("success", "Job application withdrawed successfully");
    res.redirect("/user/my-account");
  }